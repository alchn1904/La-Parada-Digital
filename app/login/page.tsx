import Link from "next/link";
import { iniciarSesion } from "../auth/actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, tarjeta } from "@/components/ui";
import { texto, type ParametrosBusqueda } from "@/lib/auth";

export default async function Login({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  return (
    <Pagina titulo="Ingresar">
      <form action={iniciarSesion} className={tarjeta + " max-w-md space-y-4"}>
        <Mensaje error={texto(q.error)} ok={texto(q.ok)} />
        <Etiqueta texto="Correo">
          <input name="email" type="email" required autoComplete="email" className={campo} />
        </Etiqueta>
        <Etiqueta texto="Clave">
          <input name="password" type="password" required autoComplete="current-password" className={campo} />
        </Etiqueta>
        <button className={boton}>Ingresar</button>
        <p className="text-sm text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="text-emerald-800 underline">
            Regístrate
          </Link>
        </p>
      </form>
    </Pagina>
  );
}
