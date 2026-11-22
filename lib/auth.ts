import { redirect } from "next/navigation";
import { crearClienteServidor } from "./supabase/server";
import type { Rol } from "./domain/roles";

export type Perfil = { id: string; rol: Rol; nombre: string; documento: string; estado: "pendiente" | "aprobado" | "rechazado" };

export async function obtenerSesion() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("perfiles").select("id, rol, nombre, documento, estado").eq("id", user.id).single();
  return { user, perfil: (data as Perfil | null) ?? null, supabase };
}

// Deja pasar solo a usuarios con perfil aprobado y uno de los roles indicados.
export async function requerirRol(...roles: Rol[]) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (!sesion.perfil || sesion.perfil.estado !== "aprobado") redirect("/panel");
  if (!roles.includes(sesion.perfil.rol)) redirect("/panel?error=" + encodeURIComponent("No tienes permiso para esa pantalla"));
  return { ...sesion, perfil: sesion.perfil };
}

export type ParametrosBusqueda = Promise<{ [clave: string]: string | string[] | undefined }>;

export function texto(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}
