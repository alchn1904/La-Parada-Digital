"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { CRITERIOS, calcularSemaforo, type Checklist } from "@/lib/domain/semaforo";

export async function registrarInspeccion(formData: FormData) {
  const { supabase, perfil } = await requerirRol("inspector");
  const puesto_id = String(formData.get("puesto_id") ?? "");
  if (!puesto_id) redirect("/inspeccion?error=" + encodeURIComponent("Elige un puesto"));
  const checklist = Object.fromEntries(CRITERIOS.map((c) => [c.clave, formData.get(c.clave) === "on"])) as Checklist;
  const semaforo = calcularSemaforo(checklist);
  const observaciones = String(formData.get("observaciones") ?? "").slice(0, 1000);
  const { error } = await supabase.from("inspecciones").insert({ puesto_id, inspector_id: perfil.id, checklist, semaforo, observaciones });
  if (error) redirect("/inspeccion?error=" + encodeURIComponent("No se pudo guardar la inspección"));
  revalidatePath("/inspeccion");
  redirect("/inspeccion?ok=" + encodeURIComponent("Inspección guardada. Semáforo: " + semaforo));
}
