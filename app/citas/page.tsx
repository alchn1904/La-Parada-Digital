import { cancelarCita, registrarVehiculo, reservarCita } from "./actions";
import { Etiqueta, Mensaje, Pagina, boton, botonSecundario, campo, formatoFechaHora, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";
import { cuposDisponibles } from "@/lib/domain/citas";

export default async function Citas({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase } = await requerirRol("transportista");
  const { data: vehiculos } = await supabase.from("vehiculos").select("id, placa, tipo, capacidad_tn").order("creado_en");
  const { data: franjas } = await supabase.from("franjas_con_cupo").select("*").gte("fecha", new Date().toISOString().slice(0, 10)).order("fecha").order("hora_inicio");
  const { data: citas } = await supabase
    .from("citas")
    .select("id, estado, vehiculos(placa), franjas(fecha, hora_inicio, hora_fin)")
    .order("creado_en", { ascending: false });

  return (
    <Pagina titulo="Citas de descarga">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">1. Mis vehículos</h2>
        <form action={registrarVehiculo} className={tarjeta + " mb-3 grid gap-4 sm:grid-cols-4"}>
          <Etiqueta texto="Placa">
            <input name="placa" required placeholder="ABC-123" maxLength={7} className={campo + " uppercase"} />
          </Etiqueta>
          <Etiqueta texto="Tipo">
            <input name="tipo" required placeholder="Camión" className={campo} />
          </Etiqueta>
          <Etiqueta texto="Capacidad (tn)">
            <input name="capacidad_tn" type="number" step="0.1" min="0.1" required className={campo} />
          </Etiqueta>
          <div className="flex items-end">
            <button className={boton}>Agregar</button>
          </div>
        </form>
        <ul className="text-sm text-slate-700">
          {(vehiculos ?? []).map((v) => (
            <li key={v.id}>
              {v.placa} · {v.tipo} · {v.capacidad_tn} tn
            </li>
          ))}
          {(vehiculos ?? []).length === 0 && <li className="text-slate-500">Registra al menos un vehículo para reservar.</li>}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">2. Reservar una franja</h2>
        <ul className="space-y-2">
          {(franjas ?? []).map((f) => {
            const cupos = cuposDisponibles({ id: f.id, aforo: f.aforo, ocupadas: f.ocupadas });
            return (
              <li key={f.id} className={tarjeta + " flex flex-wrap items-center justify-between gap-3 py-3"}>
                <span>
                  {formatoFechaHora(f.fecha, f.hora_inicio)} a {f.hora_fin.slice(0, 5)} · {cupos} de {f.aforo} cupos
                </span>
                {cupos > 0 && (vehiculos ?? []).length > 0 ? (
                  <form action={reservarCita} className="flex gap-2">
                    <input type="hidden" name="franja_id" value={f.id} />
                    <select name="vehiculo_id" className={campo + " w-auto"} aria-label="Vehículo">
                      {(vehiculos ?? []).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa}
                        </option>
                      ))}
                    </select>
                    <button className={boton}>Reservar</button>
                  </form>
                ) : (
                  <span className="text-sm text-slate-500">{cupos === 0 ? "Sin cupos" : ""}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">3. Mis citas</h2>
        <ul className="space-y-2">
          {(citas ?? []).map((c) => {
            const franja = Array.isArray(c.franjas) ? c.franjas[0] : c.franjas;
            const vehiculo = Array.isArray(c.vehiculos) ? c.vehiculos[0] : c.vehiculos;
            return (
              <li key={c.id} className={tarjeta + " flex items-center justify-between py-3"}>
                <span>
                  {vehiculo?.placa} · {franja ? formatoFechaHora(franja.fecha, franja.hora_inicio) : ""} · {c.estado}
                </span>
                {c.estado === "reservada" && (
                  <form action={cancelarCita}>
                    <input type="hidden" name="cita_id" value={c.id} />
                    <button className={botonSecundario}>Cancelar</button>
                  </form>
                )}
              </li>
            );
          })}
          {(citas ?? []).length === 0 && <li className="text-sm text-slate-500">Todavía no tienes citas.</li>}
        </ul>
      </section>
    </Pagina>
  );
}
