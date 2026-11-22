"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { puestoSchema } from "@/lib/domain/validators";

export async function registrarPuesto(formData: FormData) {
  const { supabase, perfil } = await requerirRol("comerciante");
  const datos = puestoSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) redirect("/puestos?error=" + encodeURIComponent(datos.error.issues[0].message));
  const { error } = await supabase.from("puestos").insert({ ...datos.data, comerciante_id: perfil.id });
  if (error) redirect("/puestos?error=" + encodeURIComponent("No se pudo registrar el puesto"));
  revalidatePath("/puestos");
  redirect("/puestos?ok=" + encodeURIComponent("Puesto registrado"));
}
