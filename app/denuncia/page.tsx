import { enviarDenuncia } from "./actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, tarjeta } from "@/components/ui";
import { texto, type ParametrosBusqueda } from "@/lib/auth";

export default async function Denuncia({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const codigo = texto(q.codigo);
  return (
    <Pagina titulo="Denuncia anónima">
      {codigo ? (
        <div className={tarjeta + " max-w-xl"}>
          <p className="text-slate-800">Recibimos tu denuncia. No guardamos tu nombre ni tus datos.</p>
          <p className="mt-3 text-sm text-slate-600">Tu código de seguimiento es:</p>
          <p className="mt-1 font-mono text-xl text-emerald-800">{codigo}</p>
        </div>
      ) : (
        <form action={enviarDenuncia} className={tarjeta + " max-w-xl space-y-4"}>
          <Mensaje error={texto(q.error)} />
          <Etiqueta texto="¿Qué quieres reportar?">
            <select name="categoria" className={campo} defaultValue="cobro_ilegal">
              <option value="cobro_ilegal">Cobro ilegal o cupo</option>
              <option value="salubridad">Problema de salubridad</option>
              <option value="acceso">Acceso o ingreso de vehículos</option>
              <option value="otro">Otro</option>
            </select>
          </Etiqueta>
          <Etiqueta texto="Cuéntanos qué pasó">
            <textarea name="descripcion" required minLength={10} maxLength={2000} rows={5} className={campo} />
          </Etiqueta>
          <button className={boton}>Enviar denuncia</button>
          <p className="text-xs text-slate-500">No te pedimos nombre, correo ni teléfono.</p>
        </form>
      )}
    </Pagina>
  );
}
