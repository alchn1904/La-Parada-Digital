import { registrarPuesto } from "./actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, tarjeta } from "@/components/ui";
import { requerirRol, texto, type ParametrosBusqueda } from "@/lib/auth";

const COLOR = { verde: "bg-emerald-100 text-emerald-800", ambar: "bg-amber-100 text-amber-800", rojo: "bg-red-100 text-red-800" } as const;

export default async function Puestos({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const { supabase } = await requerirRol("comerciante");
  const { data: puestos } = await supabase.from("puestos").select("id, nombre, ruc, rubro").order("creado_en", { ascending: false });
  const { data: inspecciones } = await supabase.from("inspecciones").select("puesto_id, semaforo, creado_en").order("creado_en", { ascending: false });

  return (
    <Pagina titulo="Mi puesto">
      <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
      <form action={registrarPuesto} className={tarjeta + " mb-6 grid gap-4 sm:grid-cols-3"}>
        <Etiqueta texto="Nombre del puesto">
          <input name="nombre" required className={campo} />
        </Etiqueta>
        <Etiqueta texto="RUC">
          <input name="ruc" required inputMode="numeric" pattern="[0-9]{11}" maxLength={11} className={campo} />
        </Etiqueta>
        <Etiqueta texto="Rubro">
          <input name="rubro" required className={campo} />
        </Etiqueta>
        <div className="sm:col-span-3">
          <button className={boton}>Registrar puesto</button>
        </div>
      </form>

      <ul className="space-y-3">
        {(puestos ?? []).map((p) => {
          const ultima = (inspecciones ?? []).find((i) => i.puesto_id === p.id);
          return (
            <li key={p.id} className={tarjeta + " flex items-center justify-between"}>
              <div>
                <p className="font-medium">{p.nombre}</p>
                <p className="text-sm text-slate-600">
                  RUC {p.ruc} · {p.rubro}
                </p>
              </div>
              <span className={"rounded-full px-3 py-1 text-sm " + (ultima ? COLOR[ultima.semaforo as keyof typeof COLOR] : "bg-slate-100 text-slate-600")}>
                {ultima ? "Semáforo " + ultima.semaforo : "Sin inspección"}
              </span>
            </li>
          );
        })}
        {(puestos ?? []).length === 0 && <li className="text-sm text-slate-600">Aún no registraste ningún puesto.</li>}
      </ul>
    </Pagina>
  );
}
