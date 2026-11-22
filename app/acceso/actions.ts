"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { transicionValida } from "@/lib/domain/citas";

export async function cambiarEstadoCita(formData: FormData) {
  const { supabase } = await requerirRol("acceso");
  const id = String(formData.get("cita_id") ?? "");
  const hacia = String(formData.get("hacia") ?? "");
  const { data: cita } = await supabase.from("citas").select("estado").eq("id", id).single();
  if (!cita || !["ingresada", "salida"].includes(hacia) || !transicionValida(cita.estado, hacia)) {
    redirect("/acceso?error=" + encodeURIComponent("Ese cambio de estado no es válido"));
  }
  const { error } = await supabase.from("citas").update({ estado: hacia }).eq("id", id);
  if (error) redirect("/acceso?error=" + encodeURIComponent("No se pudo registrar"));
  revalidatePath("/acceso");
  redirect("/acceso?ok=" + encodeURIComponent(hacia === "ingresada" ? "Ingreso registrado" : "Salida registrada"));
}
