import { atenderEstibaje, solicitarEstibaje } from "./actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, formatoFechaHora, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";
import { formatoSoles } from "@/lib/domain/tarifario";

export default async function Estibaje({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase, perfil } = await requerirRol("transportista", "estibador");
  const { data: tarifas } = await supabase.from("tarifas").select("concepto, monto");
  const base = Number(tarifas?.find((t) => t.concepto === "estibaje_base")?.monto ?? 0);
  const porTn = Number(tarifas?.find((t) => t.concepto === "estibaje_por_tn")?.monto ?? 0);
  const { data: servicios } = await supabase
    .from("servicios_estibaje")
    .select("id, peso_tn, monto, estado, citas(vehiculos(placa), franjas(fecha, hora_inicio))")
    .order("creado_en", { ascending: false });
  const esTransportista = perfil.rol === "transportista";
  const { data: citas } = esTransportista
    ? await supabase.from("citas").select("id, vehiculos(placa), franjas(fecha, hora_inicio)").in("estado", ["reservada", "ingresada"])
    : { data: [] };

  return (
    <Pagina titulo="Estibaje transparente">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
      <p className={tarjeta + " mb-6 text-sm text-slate-700"}>
        Tarifario oficial: {formatoSoles(base)} de base + {formatoSoles(porTn)} por tonelada. No se puede cobrar otro monto.
      </p>

      {esTransportista && (
        <form action={solicitarEstibaje} className={tarjeta + " mb-6 grid gap-4 sm:grid-cols-3"}>
          <Etiqueta texto="Cita">
            <select name="cita_id" required className={campo}>
              {(citas ?? []).map((c) => {
                const franja = Array.isArray(c.franjas) ? c.franjas[0] : c.franjas;
                const vehiculo = Array.isArray(c.vehiculos) ? c.vehiculos[0] : c.vehiculos;
                return (
                  <option key={c.id} value={c.id}>
                    {vehiculo?.placa} · {franja ? formatoFechaHora(franja.fecha, franja.hora_inicio) : ""}
                  </option>
                );
              })}
            </select>
          </Etiqueta>
          <Etiqueta texto="Peso de la carga (tn)">
            <input name="peso_tn" type="number" step="0.1" min="0.1" required className={campo} />
          </Etiqueta>
          <div className="flex items-end">
            <button className={boton}>Solicitar estibaje</button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {(servicios ?? []).map((s) => {
          const cita = Array.isArray(s.citas) ? s.citas[0] : s.citas;
          const vehiculo = Array.isArray(cita?.vehiculos) ? cita?.vehiculos[0] : cita?.vehiculos;
          return (
            <li key={s.id} className={tarjeta + " flex items-center justify-between py-3"}>
              <span>
                {vehiculo?.placa} · {s.peso_tn} tn · <strong>{formatoSoles(Number(s.monto))}</strong> · {s.estado}
              </span>
              {perfil.rol === "estibador" && s.estado === "solicitado" && (
                <form action={atenderEstibaje}>
                  <input type="hidden" name="servicio_id" value={s.id} />
                  <button className={boton}>Atender</button>
                </form>
              )}
            </li>
          );
        })}
        {(servicios ?? []).length === 0 && <li className="text-sm text-slate-500">No hay servicios todavía.</li>}
      </ul>
    </Pagina>
  );
}
