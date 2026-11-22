"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { estibajeSchema } from "@/lib/domain/validators";

function volver(clave: "error" | "ok", mensaje: string): never {
  redirect("/estibaje?" + clave + "=" + encodeURIComponent(mensaje));
}

export async function solicitarEstibaje(formData: FormData) {
  const { supabase, perfil } = await requerirRol("transportista");
  const datos = estibajeSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) volver("error", datos.error.issues[0].message);
  // El monto no se envía: lo calcula la base de datos con el tarifario oficial.
  const { error } = await supabase.from("servicios_estibaje").insert({ cita_id: datos.data.cita_id, peso_tn: datos.data.peso_tn, transportista_id: perfil.id });
  if (error) volver("error", "No se pudo solicitar el estibaje");
  revalidatePath("/estibaje");
  volver("ok", "Estibaje solicitado");
}

export async function atenderEstibaje(formData: FormData) {
  const { supabase, perfil } = await requerirRol("estibador");
  const id = String(formData.get("servicio_id") ?? "");
  const { error } = await supabase.from("servicios_estibaje").update({ estado: "atendido", estibador_id: perfil.id }).eq("id", id).eq("estado", "solicitado");
  if (error) volver("error", "No se pudo atender el servicio");
  revalidatePath("/estibaje");
  volver("ok", "Servicio atendido. El comprobante quedó registrado.");
}
