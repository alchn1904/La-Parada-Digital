import { registrarInspeccion } from "./actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";
import { CRITERIOS } from "@/lib/domain/semaforo";

const COLOR = { verde: "bg-emerald-100 text-emerald-800", ambar: "bg-amber-100 text-amber-800", rojo: "bg-red-100 text-red-800" } as const;

export default async function Inspeccion({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase, perfil } = await requerirRol("inspector", "administrador");
  const { data: puestos } = await supabase.from("puestos").select("id, nombre, ruc").order("nombre");
  const { data: inspecciones } = await supabase
    .from("inspecciones")
    .select("id, semaforo, observaciones, creado_en, puestos(nombre)")
    .order("creado_en", { ascending: false })
    .limit(20);

  return (
    <Pagina titulo="Inspección sanitaria">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
      {perfil.rol === "inspector" && (
        <form action={registrarInspeccion} className={tarjeta + " mb-6 space-y-4"}>
          <Etiqueta texto="Puesto">
            <select name="puesto_id" required className={campo}>
              {(puestos ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} · RUC {p.ruc}
                </option>
              ))}
            </select>
          </Etiqueta>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Marca lo que cumple</legend>
            {CRITERIOS.map((c) => (
              <label key={c.clave} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={c.clave} /> {c.texto} {c.critico && <span className="text-xs text-red-700">(crítico)</span>}
              </label>
            ))}
          </fieldset>
          <Etiqueta texto="Observaciones">
            <textarea name="observaciones" rows={3} maxLength={1000} className={campo} />
          </Etiqueta>
          <button className={boton}>Guardar inspección</button>
        </form>
      )}

      <ul className="space-y-2">
        {(inspecciones ?? []).map((i) => {
          const puesto = Array.isArray(i.puestos) ? i.puestos[0] : i.puestos;
          return (
            <li key={i.id} className={tarjeta + " flex items-center justify-between py-3"}>
              <span>
                {puesto?.nombre} · {new Date(i.creado_en).toLocaleDateString("es-PE")}
                {i.observaciones && <span className="block text-sm text-slate-500">{i.observaciones}</span>}
              </span>
              <span className={"rounded-full px-3 py-1 text-sm " + COLOR[i.semaforo as keyof typeof COLOR]}>{i.semaforo}</span>
            </li>
          );
        })}
        {(inspecciones ?? []).length === 0 && <li className="text-sm text-slate-500">Todavía no hay inspecciones.</li>}
      </ul>
    </Pagina>
  );
}
