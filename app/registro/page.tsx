import { registrarse } from "../auth/actions";
import { Etiqueta, Mensaje, Pagina, boton, campo, tarjeta } from "@/components/ui";
import { texto, type ParametrosBusqueda } from "@/lib/auth";
import { NOMBRE_ROL, ROLES_AUTOREGISTRO } from "@/lib/domain/roles";

export default async function Registro({ searchParams }: { searchParams: ParametrosBusqueda }) {
  const q = await searchParams;
  return (
    <Pagina titulo="Crear cuenta">
      <form action={registrarse} className={tarjeta + " max-w-md space-y-4"}>
        <Mensaje error={texto(q.error)} />
        <Etiqueta texto="Nombre completo">
          <input name="nombre" required minLength={3} className={campo} />
        </Etiqueta>
        <Etiqueta texto="DNI">
          <input name="documento" required inputMode="numeric" pattern="[0-9]{8}" maxLength={8} className={campo} />
        </Etiqueta>
        <Etiqueta texto="Rol">
          <select name="rol" className={campo} defaultValue="comerciante">
            {ROLES_AUTOREGISTRO.map((r) => (
              <option key={r} value={r}>
                {NOMBRE_ROL[r]}
              </option>
            ))}
          </select>
        </Etiqueta>
        <Etiqueta texto="Correo">
          <input name="email" type="email" required autoComplete="email" className={campo} />
        </Etiqueta>
        <Etiqueta texto="Clave (mínimo 8 caracteres)">
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={campo} />
        </Etiqueta>
        <button className={boton}>Crear cuenta</button>
        <p className="text-xs text-slate-500">Tu cuenta quedará pendiente hasta que un administrador la apruebe.</p>
      </form>
    </Pagina>
  );
}
