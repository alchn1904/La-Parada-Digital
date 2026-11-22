import { resolverPerfil } from "./actions";
import { Mensaje, Pagina, boton, botonSecundario, campo, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";
import { NOMBRE_ROL, ROLES } from "@/lib/domain/roles";

export default async function Padron({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase } = await requerirRol("administrador");
  const { data: perfiles } = await supabase.from("perfiles").select("id, nombre, documento, rol, estado").order("creado_en", { ascending: false });

  return (
    <Pagina titulo="Padrón de operadores">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
      <ul className="space-y-3">
        {(perfiles ?? []).map((p) => (
          <li key={p.id} className={tarjeta + " flex flex-wrap items-center justify-between gap-3"}>
            <span>
              <strong>{p.nombre}</strong> · DNI {p.documento}
              <span className="block text-sm text-slate-600">
                {NOMBRE_ROL[p.rol as keyof typeof NOMBRE_ROL]} · {p.estado}
              </span>
            </span>
            {p.estado === "pendiente" && (
              <form action={resolverPerfil} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="perfil_id" value={p.id} />
                <select name="rol" defaultValue={p.rol} className={campo + " w-auto"} aria-label="Rol asignado">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {NOMBRE_ROL[r]}
                    </option>
                  ))}
                </select>
                <button name="decision" value="aprobado" className={boton}>
                  Aprobar
                </button>
                <button name="decision" value="rechazado" className={botonSecundario}>
                  Rechazar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
