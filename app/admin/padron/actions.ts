"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { ROLES, esRol } from "@/lib/domain/roles";

export async function resolverPerfil(formData: FormData) {
  const { supabase, perfil } = await requerirRol("administrador");
  const id = String(formData.get("perfil_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const rol = String(formData.get("rol") ?? "");
  if (!id || !["aprobado", "rechazado"].includes(decision) || !esRol(rol) || !ROLES.includes(rol)) {
    redirect("/admin/padron?error=" + encodeURIComponent("Datos no válidos"));
  }
  if (id === perfil.id) redirect("/admin/padron?error=" + encodeURIComponent("No puedes cambiar tu propio perfil"));
  const { error } = await supabase.from("perfiles").update({ estado: decision, rol }).eq("id", id);
  if (error) redirect("/admin/padron?error=" + encodeURIComponent("No se pudo actualizar el perfil"));
  revalidatePath("/admin/padron");
  redirect("/admin/padron?ok=" + encodeURIComponent(decision === "aprobado" ? "Cuenta aprobada" : "Cuenta rechazada"));
}
