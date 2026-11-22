import Link from "next/link";
import { redirect } from "next/navigation";
import { Mensaje, Pagina, tarjeta } from "@/components/ui";
import { obtenerSesion, texto, type ParametrosBusqueda } from "@/lib/auth";
import { NOMBRE_ROL } from "@/lib/domain/roles";

const ACCESOS: Record<string, { href: string; titulo: string; texto: string }[]> = {
  comerciante: [{ href: "/puestos", titulo: "Mi puesto", texto: "Registra tu puesto con su RUC y revisa su semáforo sanitario." }],
  transportista: [
    { href: "/citas", titulo: "Citas de descarga", texto: "Registra tus vehículos y reserva una franja." },
    { href: "/estibaje", titulo: "Estibaje", texto: "Solicita el servicio y mira el monto oficial." },
  ],
  estibador: [{ href: "/estibaje", titulo: "Servicios de estibaje", texto: "Atiende las solicitudes pendientes." }],
  acceso: [{ href: "/acceso", titulo: "Control de acceso", texto: "Registra el ingreso y la salida de vehículos." }],
  inspector: [{ href: "/inspeccion", titulo: "Inspecciones", texto: "Completa el checklist y obtén el semáforo." }],
  administrador: [
    { href: "/admin/padron", titulo: "Padrón", texto: "Aprueba o rechaza cuentas nuevas." },
    { href: "/admin/bitacora", titulo: "Bitácora", texto: "Revisa quién hizo qué." },
    { href: "/admin/denuncias", titulo: "Denuncias", texto: "Lee las denuncias anónimas." },
    { href: "/acceso", titulo: "Control de acceso", texto: "Consulta el ingreso y la salida." },
    { href: "/inspeccion", titulo: "Inspecciones", texto: "Consulta las inspecciones." },
  ],
};

export default async function Panel({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  const { perfil } = sesion;

  if (!perfil || perfil.estado !== "aprobado") {
    return (
      <Pagina titulo="Tu cuenta está en revisión">
        <p className={tarjeta + " text-slate-700"}>
          {perfil?.estado === "rechazado"
            ? "Tu cuenta fue rechazada. Comunícate con la administración del mercado."
            : "Un administrador debe aprobar tu cuenta antes de que puedas operar. Vuelve a ingresar más tarde."}
        </p>
      </Pagina>
    );
  }

  return (
    <Pagina titulo={"Hola, " + perfil.nombre}>
      <Mensaje error={texto(q.error)} />
      <p className="mb-4 text-sm text-slate-600">Rol: {NOMBRE_ROL[perfil.rol]}</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {(ACCESOS[perfil.rol] ?? []).map((a) => (
          <li key={a.href}>
            <Link href={a.href} className={tarjeta + " block hover:border-emerald-600"}>
              <h2 className="font-medium text-emerald-800">{a.titulo}</h2>
              <p className="mt-1 text-sm text-slate-600">{a.texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
