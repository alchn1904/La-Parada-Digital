-- Datos iniciales: tarifario oficial y franjas de ejemplo (próximos 7 días).
insert into public.tarifas (concepto, monto) values
  ('estibaje_base', 15.00),
  ('estibaje_por_tn', 8.00)
on conflict (concepto) do nothing;

insert into public.franjas (fecha, hora_inicio, hora_fin, aforo)
select d::date, h.inicio, h.fin, 4
from generate_series(current_date + 1, current_date + 7, interval '1 day') as d,
     (values ('04:00'::time, '07:00'::time), ('07:00'::time, '10:00'::time), ('10:00'::time, '13:00'::time)) as h(inicio, fin)
on conflict (fecha, hora_inicio) do nothing;

-- El primer administrador se asigna a mano después de registrarse:
-- update public.perfiles set rol = 'administrador', estado = 'aprobado' where id = '<uuid del usuario>';
