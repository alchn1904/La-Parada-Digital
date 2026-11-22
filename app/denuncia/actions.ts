"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { denunciaSchema } from "@/lib/domain/validators";

export async function enviarDenuncia(formData: FormData) {
  const datos = denunciaSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) redirect("/denuncia?error=" + encodeURIComponent(datos.error.issues[0].message));
  const supabase = await crearClienteServidor();
  // La función crear_denuncia no guarda quién la envía y devuelve el código de seguimiento.
  const { data, error } = await supabase.rpc("crear_denuncia", { p_categoria: datos.data.categoria, p_descripcion: datos.data.descripcion });
  if (error || !data) redirect("/denuncia?error=" + encodeURIComponent("No se pudo enviar la denuncia. Inténtalo de nuevo."));
  redirect("/denuncia?codigo=" + encodeURIComponent(String(data)));
}
