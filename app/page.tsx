import Link from "next/link";
import { Pagina, boton, botonSecundario, tarjeta } from "@/components/ui";

const MODULOS = [
  ["Registro y padrón", "Comerciantes, estibadores y transportistas se registran y un administrador los valida."],
  ["Citas de vehículos", "Cada camión reserva una franja de descarga con cupos limitados."],
  ["Estibaje transparente", "El cobro sale del tarifario oficial: sin cupos ni montos a discreción."],
  ["Inspección sanitaria", "Checklist por puesto y semáforo verde, ámbar o rojo."],
  ["Denuncia anónima", "Cualquier persona puede reportar un abuso sin dar su nombre."],
];

export default function Inicio() {
  return (
    <Pagina titulo="La Parada Digital">
      <p className="mb-6 max-w-2xl text-slate-700">
        Una plataforma web para ordenar el ingreso de vehículos, transparentar el cobro de estibaje y dar seguimiento
        a la salubridad en el mercado de La Parada.
      </p>
      <div className="mb-8 flex gap-3">
        <Link href="/login" className={boton}>
          Ingresar
        </Link>
        <Link href="/registro" className={botonSecundario}>
          Crear cuenta
        </Link>
        <Link href="/denuncia" className={botonSecundario}>
          Hacer una denuncia anónima
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {MODULOS.map(([titulo, texto]) => (
          <li key={titulo} className={tarjeta}>
            <h2 className="font-medium text-emerald-800">{titulo}</h2>
            <p className="mt-1 text-sm text-slate-600">{texto}</p>
          </li>
        ))}
      </ul>
    </Pagina>
  );
}
