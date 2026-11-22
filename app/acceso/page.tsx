import { cambiarEstadoCita } from "./actions";
import { Mensaje, Pagina, boton, formatoFechaHora, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";

export default async function Acceso({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase, perfil } = await requerirRol("acceso", "administrador");
  const { data: citas } = await supabase
    .from("citas")
    .select("id, estado, vehiculos(placa, tipo), franjas(fecha, hora_inicio)")
    .in("estado", ["reservada", "ingresada"])
    .order("creado_en");
  const puedeOperar = perfil.rol === "acceso";

  return (
    <Pagina titulo="Control de acceso">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
      <ul className="space-y-2">
        {(citas ?? []).map((c) => {
          const franja = Array.isArray(c.franjas) ? c.franjas[0] : c.franjas;
          const vehiculo = Array.isArray(c.vehiculos) ? c.vehiculos[0] : c.vehiculos;
          return (
            <li key={c.id} className={tarjeta + " flex items-center justify-between py-3"}>
              <span>
                <strong>{vehiculo?.placa}</strong> · {vehiculo?.tipo} · {franja ? formatoFechaHora(franja.fecha, franja.hora_inicio) : ""} · {c.estado}
              </span>
              {puedeOperar && (
                <form action={cambiarEstadoCita}>
                  <input type="hidden" name="cita_id" value={c.id} />
                  <input type="hidden" name="hacia" value={c.estado === "reservada" ? "ingresada" : "salida"} />
                  <button className={boton}>{c.estado === "reservada" ? "Registrar ingreso" : "Registrar salida"}</button>
                </form>
              )}
            </li>
          );
        })}
        {(citas ?? []).length === 0 && <li className="text-sm text-slate-500">No hay vehículos pendientes.</li>}
      </ul>
    </Pagina>
  );
}
