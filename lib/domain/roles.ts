// Roles y permisos de La Parada Digital (RBAC).
// La base de datos aplica las mismas reglas con Row Level Security; esto evita mostrar pantallas que no corresponden.

export const ROLES = ["comerciante", "estibador", "transportista", "inspector", "acceso", "administrador"] as const;
export type Rol = (typeof ROLES)[number];

// Solo estos roles se pueden elegir al registrarse. Los demás los asigna un administrador.
export const ROLES_AUTOREGISTRO: readonly Rol[] = ["comerciante", "estibador", "transportista"];

export const NOMBRE_ROL: Record<Rol, string> = {
  comerciante: "Comerciante",
  estibador: "Estibador",
  transportista: "Transportista",
  inspector: "Inspector sanitario",
  acceso: "Personal de acceso",
  administrador: "Administrador",
};

export type Accion =
  | "puesto:registrar"
  | "vehiculo:registrar"
  | "cita:reservar"
  | "cita:cancelar"
  | "cita:registrar_ingreso"
  | "estibaje:solicitar"
  | "estibaje:atender"
  | "inspeccion:registrar"
  | "padron:aprobar"
  | "bitacora:ver"
  | "denuncia:ver";

const PERMISOS: Record<Rol, readonly Accion[]> = {
  comerciante: ["puesto:registrar"],
  estibador: ["estibaje:atender"],
  transportista: ["vehiculo:registrar", "cita:reservar", "cita:cancelar", "estibaje:solicitar"],
  inspector: ["inspeccion:registrar"],
  acceso: ["cita:registrar_ingreso"],
  administrador: ["padron:aprobar", "bitacora:ver", "denuncia:ver"],
};

export function can(rol: Rol | null | undefined, accion: Accion): boolean {
  if (!rol) return false;
  return PERMISOS[rol].includes(accion);
}

// Rutas privadas y los roles que pueden entrar a cada una.
const RUTAS: { prefijo: string; roles: readonly Rol[] }[] = [
  { prefijo: "/admin", roles: ["administrador"] },
  { prefijo: "/citas", roles: ["transportista"] },
  { prefijo: "/estibaje", roles: ["transportista", "estibador"] },
  { prefijo: "/acceso", roles: ["acceso", "administrador"] },
  { prefijo: "/inspeccion", roles: ["inspector", "administrador"] },
  { prefijo: "/puestos", roles: ["comerciante"] },
];

export function rutaPermitida(rol: Rol | null | undefined, pathname: string): boolean {
  const regla = RUTAS.find((r) => pathname === r.prefijo || pathname.startsWith(r.prefijo + "/"));
  if (!regla) return true;
  return !!rol && regla.roles.includes(rol);
}

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}
