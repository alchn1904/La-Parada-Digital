import Link from "next/link";
import { obtenerSesion } from "@/lib/auth";
import { NOMBRE_ROL } from "@/lib/domain/roles";
import { cerrarSesion } from "@/app/auth/actions";

const ENLACES: { href: string; texto: string; roles: string[] }[] = [
  { href: "/puestos", texto: "Mi puesto", roles: ["comerciante"] },
  { href: "/citas", texto: "Citas", roles: ["transportista"] },
  { href: "/estibaje", texto: "Estibaje", roles: ["transportista", "estibador"] },
  { href: "/acceso", texto: "Acceso", roles: ["acceso", "administrador"] },
  { href: "/inspeccion", texto: "Inspección", roles: ["inspector", "administrador"] },
  { href: "/admin/padron", texto: "Padrón", roles: ["administrador"] },
  { href: "/admin/bitacora", texto: "Bitácora", roles: ["administrador"] },
  { href: "/admin/denuncias", texto: "Denuncias", roles: ["administrador"] },
];

export async function Cabecera() {
  const sesion = await obtenerSesion();
  const rol = sesion?.perfil?.estado === "aprobado" ? sesion.perfil.rol : null;
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold text-emerald-800">
          La Parada Digital
        </Link>
        {rol && ENLACES.filter((e) => e.roles.includes(rol)).map((e) => (
          <Link key={e.href} href={e.href} className="text-slate-700 hover:text-emerald-800">
            {e.texto}
          </Link>
        ))}
        <span className="ml-auto flex items-center gap-3">
          <Link href="/denuncia" className="text-slate-600 hover:text-emerald-800">
            Denuncia anónima
          </Link>
          {sesion?.perfil ? (
            <>
              <Link href="/panel" className="text-slate-700">
                {sesion.perfil.nombre} · {NOMBRE_ROL[sesion.perfil.rol]}
              </Link>
              <form action={cerrarSesion}>
                <button className="text-slate-600 underline">Salir</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="font-medium text-emerald-800">
              Ingresar
            </Link>
          )}
        </span>
      </nav>
    </header>
  );
}
