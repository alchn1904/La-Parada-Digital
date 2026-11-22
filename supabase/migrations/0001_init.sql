-- La Parada Digital: esquema inicial con Row Level Security (zero trust).
-- Cada rol solo ve y modifica lo que necesita. La bitácora solo admite inserciones.

create type public.rol_usuario as enum ('comerciante', 'estibador', 'transportista', 'inspector', 'acceso', 'administrador');
create type public.estado_perfil as enum ('pendiente', 'aprobado', 'rechazado');
create type public.estado_cita as enum ('reservada', 'cancelada', 'ingresada', 'salida');
create type public.estado_servicio as enum ('solicitado', 'atendido');
create type public.semaforo as enum ('verde', 'ambar', 'rojo');

-- ---------- Tablas ----------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null default 'comerciante',
  nombre text not null,
  documento text not null,
  estado public.estado_perfil not null default 'pendiente',
  creado_en timestamptz not null default now()
);

create table public.puestos (
  id uuid primary key default gen_random_uuid(),
  comerciante_id uuid not null references public.perfiles (id) on delete cascade,
  nombre text not null,
  ruc text not null check (ruc ~ '^[0-9]{11}$'),
  rubro text not null,
  creado_en timestamptz not null default now()
);

create table public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  transportista_id uuid not null references public.perfiles (id) on delete cascade,
  placa text not null unique check (placa ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}$'),
  tipo text not null,
  capacidad_tn numeric(6, 2) not null check (capacidad_tn > 0),
  creado_en timestamptz not null default now()
);

create table public.franjas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio),
  aforo int not null check (aforo > 0),
  unique (fecha, hora_inicio)
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  franja_id uuid not null references public.franjas (id),
  vehiculo_id uuid not null references public.vehiculos (id),
  transportista_id uuid not null references public.perfiles (id),
  estado public.estado_cita not null default 'reservada',
  creado_en timestamptz not null default now()
);
create unique index citas_una_activa_por_vehiculo_y_franja
  on public.citas (franja_id, vehiculo_id) where estado <> 'cancelada';

create table public.tarifas (
  concepto text primary key,
  monto numeric(10, 2) not null check (monto >= 0)
);

create table public.servicios_estibaje (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references public.citas (id),
  transportista_id uuid not null references public.perfiles (id),
  estibador_id uuid references public.perfiles (id),
  peso_tn numeric(6, 2) not null check (peso_tn > 0),
  monto numeric(10, 2) not null default 0,
  estado public.estado_servicio not null default 'solicitado',
  creado_en timestamptz not null default now()
);

create table public.inspecciones (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references public.perfiles (id),
  puesto_id uuid not null references public.puestos (id),
  checklist jsonb not null,
  semaforo public.semaforo not null,
  observaciones text not null default '',
  creado_en timestamptz not null default now()
);

create table public.denuncias (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  categoria text not null check (categoria in ('cobro_ilegal', 'salubridad', 'acceso', 'otro')),
  descripcion text not null check (char_length(descripcion) between 10 and 2000),
  creado_en timestamptz not null default now()
);

create table public.bitacora (
  id bigint generated always as identity primary key,
  actor uuid,
  accion text not null,
  entidad text not null,
  entidad_id text,
  detalle jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

-- ---------- Funciones ----------
-- Rol del usuario autenticado (solo si su perfil está aprobado).
create function public.mi_rol() returns public.rol_usuario
language sql stable security definer set search_path = '' as $$
  select rol from public.perfiles where id = auth.uid() and estado = 'aprobado'
$$;

-- Al registrarse solo se puede elegir comerciante, estibador o transportista.
-- Los demás roles los asigna un administrador. Todo perfil nace en estado pendiente.
create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r public.rol_usuario;
begin
  r := case
    when new.raw_user_meta_data ->> 'rol' in ('comerciante', 'estibador', 'transportista')
      then (new.raw_user_meta_data ->> 'rol')::public.rol_usuario
    else 'comerciante'::public.rol_usuario end;
  insert into public.perfiles (id, rol, nombre, documento)
  values (new.id, r, coalesce(new.raw_user_meta_data ->> 'nombre', 'Sin nombre'), coalesce(new.raw_user_meta_data ->> 'documento', ''));
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users for each row execute function public.crear_perfil();

-- Aforo por franja: bloquea la franja y rechaza la cita si ya está llena.
create function public.validar_aforo_cita() returns trigger
language plpgsql security definer set search_path = '' as $$
declare f public.franjas; ocupadas int;
begin
  select * into f from public.franjas where id = new.franja_id for update;
  select count(*) into ocupadas from public.citas where franja_id = new.franja_id and estado <> 'cancelada';
  if ocupadas >= f.aforo then
    raise exception 'La franja ya no tiene cupos disponibles';
  end if;
  return new;
end $$;
create trigger antes_de_reservar before insert on public.citas for each row execute function public.validar_aforo_cita();

-- El monto de estibaje lo calcula la base de datos con el tarifario oficial (no se confía en el cliente).
create function public.calcular_monto_estibaje() returns trigger
language plpgsql security definer set search_path = '' as $$
declare base numeric; por_tn numeric;
begin
  select monto into base from public.tarifas where concepto = 'estibaje_base';
  select monto into por_tn from public.tarifas where concepto = 'estibaje_por_tn';
  new.monto := round(coalesce(base, 0) + coalesce(por_tn, 0) * new.peso_tn, 2);
  return new;
end $$;
create trigger antes_de_solicitar_estibaje before insert on public.servicios_estibaje for each row execute function public.calcular_monto_estibaje();

-- Denuncia anónima: no guarda quién la envió y devuelve un código de seguimiento.
create function public.crear_denuncia(p_categoria text, p_descripcion text) returns text
language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  c := 'DEN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.denuncias (codigo, categoria, descripcion) values (c, p_categoria, p_descripcion);
  return c;
end $$;
revoke all on function public.crear_denuncia(text, text) from public;
grant execute on function public.crear_denuncia(text, text) to anon, authenticated;

-- Bitácora de auditoría: se llena sola con triggers y nadie puede editarla.
create function public.registrar_bitacora() returns trigger
language plpgsql security definer set search_path = '' as $$
declare fila jsonb;
begin
  fila := to_jsonb(coalesce(new, old));
  insert into public.bitacora (actor, accion, entidad, entidad_id, detalle)
  values (auth.uid(), tg_op, tg_table_name, coalesce(fila ->> 'id', fila ->> 'codigo'), fila);
  return coalesce(new, old);
end $$;
create trigger audit_perfiles after insert or update on public.perfiles for each row execute function public.registrar_bitacora();
create trigger audit_citas after insert or update on public.citas for each row execute function public.registrar_bitacora();
create trigger audit_servicios after insert or update on public.servicios_estibaje for each row execute function public.registrar_bitacora();
create trigger audit_inspecciones after insert on public.inspecciones for each row execute function public.registrar_bitacora();
create trigger audit_denuncias after insert on public.denuncias for each row execute function public.registrar_bitacora();

-- ---------- Row Level Security ----------
alter table public.perfiles enable row level security;
alter table public.puestos enable row level security;
alter table public.vehiculos enable row level security;
alter table public.franjas enable row level security;
alter table public.citas enable row level security;
alter table public.tarifas enable row level security;
alter table public.servicios_estibaje enable row level security;
alter table public.inspecciones enable row level security;
alter table public.denuncias enable row level security;
alter table public.bitacora enable row level security;

-- perfiles: cada quien ve el suyo; el administrador ve y aprueba todos. Nadie edita su propio rol.
create policy perfiles_ver on public.perfiles for select using (id = auth.uid() or public.mi_rol() = 'administrador');
create policy perfiles_admin_actualiza on public.perfiles for update using (public.mi_rol() = 'administrador') with check (public.mi_rol() = 'administrador');

-- puestos
create policy puestos_comerciante_ve on public.puestos for select using (comerciante_id = auth.uid() or public.mi_rol() in ('administrador', 'inspector'));
create policy puestos_comerciante_crea on public.puestos for insert with check (comerciante_id = auth.uid() and public.mi_rol() = 'comerciante');

-- vehiculos
create policy vehiculos_ve on public.vehiculos for select using (transportista_id = auth.uid() or public.mi_rol() in ('administrador', 'acceso'));
create policy vehiculos_crea on public.vehiculos for insert with check (transportista_id = auth.uid() and public.mi_rol() = 'transportista');

-- franjas: las ven todos los roles aprobados; solo el administrador las configura
create policy franjas_ver on public.franjas for select using (public.mi_rol() is not null);
create policy franjas_admin on public.franjas for all using (public.mi_rol() = 'administrador') with check (public.mi_rol() = 'administrador');

-- citas
create policy citas_ver on public.citas for select using (transportista_id = auth.uid() or public.mi_rol() in ('administrador', 'acceso', 'estibador'));
create policy citas_reservar on public.citas for insert with check (transportista_id = auth.uid() and public.mi_rol() = 'transportista' and estado = 'reservada');
create policy citas_transportista_cancela on public.citas for update using (transportista_id = auth.uid() and public.mi_rol() = 'transportista' and estado = 'reservada') with check (estado = 'cancelada');
create policy citas_acceso_actualiza on public.citas for update using (public.mi_rol() = 'acceso') with check (estado in ('ingresada', 'salida'));

-- tarifas: oficiales y visibles para todos los roles aprobados
create policy tarifas_ver on public.tarifas for select using (public.mi_rol() is not null);
create policy tarifas_admin on public.tarifas for all using (public.mi_rol() = 'administrador') with check (public.mi_rol() = 'administrador');

-- servicios de estibaje
create policy servicios_ver on public.servicios_estibaje for select using (transportista_id = auth.uid() or estibador_id = auth.uid() or public.mi_rol() in ('administrador', 'estibador'));
create policy servicios_solicitar on public.servicios_estibaje for insert with check (transportista_id = auth.uid() and public.mi_rol() = 'transportista' and estado = 'solicitado');
create policy servicios_atender on public.servicios_estibaje for update using (public.mi_rol() = 'estibador') with check (estibador_id = auth.uid() and estado = 'atendido');

-- inspecciones
create policy inspecciones_ver on public.inspecciones for select using (
  public.mi_rol() in ('inspector', 'administrador')
  or exists (select 1 from public.puestos p where p.id = puesto_id and p.comerciante_id = auth.uid()));
create policy inspecciones_crear on public.inspecciones for insert with check (inspector_id = auth.uid() and public.mi_rol() = 'inspector');

-- denuncias: solo el administrador las lee (el envío anónimo pasa por crear_denuncia)
create policy denuncias_admin_ve on public.denuncias for select using (public.mi_rol() = 'administrador');

-- bitácora: solo lectura para el administrador; sin update ni delete para nadie
create policy bitacora_admin_ve on public.bitacora for select using (public.mi_rol() = 'administrador');
revoke update, delete, truncate on public.bitacora from anon, authenticated;
revoke insert on public.bitacora from anon, authenticated;

-- Vista con los cupos ocupados por franja. El transportista no puede ver las citas de otros,
-- pero sí necesita saber cuántos cupos quedan. Solo la ven los usuarios con perfil aprobado.
create view public.franjas_con_cupo with (security_invoker = false) as
  select f.id, f.fecha, f.hora_inicio, f.hora_fin, f.aforo,
         (select count(*) from public.citas c where c.franja_id = f.id and c.estado <> 'cancelada')::int as ocupadas
  from public.franjas f
  where public.mi_rol() is not null;
revoke all on public.franjas_con_cupo from anon;
grant select on public.franjas_con_cupo to authenticated;
