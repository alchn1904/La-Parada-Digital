import { Pagina, tarjeta } from "@/components/ui";
import { requerirRol } from "@/lib/auth";

export default async function Denuncias() {
  const { supabase } = await requerirRol("administrador");
  const { data: denuncias } = await supabase.from("denuncias").select("id, codigo, categoria, descripcion, creado_en").order("creado_en", { ascending: false });

  return (
    <Pagina titulo="Denuncias anónimas">
      <ul className="space-y-3">
        {(denuncias ?? []).map((d) => (
          <li key={d.id} className={tarjeta}>
            <p className="text-sm text-slate-500">
              {d.codigo} · {d.categoria} · {new Date(d.creado_en).toLocaleDateString("es-PE")}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{d.descripcion}</p>
          </li>
        ))}
        {(denuncias ?? []).length === 0 && <li className="text-sm text-slate-500">No hay denuncias.</li>}
      </ul>
    </Pagina>
  );
}
