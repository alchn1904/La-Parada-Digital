import { Pagina, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/auth";

export default async function Bitacora() {
  const { supabase } = await requerirRol("administrador");
  const { data: filas } = await supabase.from("bitacora").select("id, accion, entidad, entidad_id, creado_en").order("id", { ascending: false }).limit(100);

  return (
    <Pagina titulo="Bitácora de auditoría">
      <p className="mb-4 text-sm text-slate-600">Registro de solo lectura: nadie puede editarlo ni borrarlo.</p>
      <div className={tarjeta + " overflow-x-auto p-0"}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Acción</th>
              <th className="px-3 py-2">Entidad</th>
              <th className="px-3 py-2">Id</th>
            </tr>
          </thead>
          <tbody>
            {(filas ?? []).map((f) => (
              <tr key={f.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{new Date(f.creado_en).toLocaleString("es-PE")}</td>
                <td className="px-3 py-2">{f.accion}</td>
                <td className="px-3 py-2">{f.entidad}</td>
                <td className="px-3 py-2 font-mono text-xs">{f.entidad_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pagina>
  );
}
