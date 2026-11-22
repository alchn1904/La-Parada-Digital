"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/domain/validators";

function volver(ruta: string, clave: "error" | "ok", mensaje: string): never {
  redirect(ruta + "?" + clave + "=" + encodeURIComponent(mensaje));
}

export async function iniciarSesion(formData: FormData) {
  const datos = loginSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) volver("/login", "error", datos.error.issues[0].message);
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword(datos.data);
  // Mensaje genérico: no se revela si el correo existe.
  if (error) volver("/login", "error", "Correo o clave incorrectos");
  redirect("/panel");
}

export async function registrarse(formData: FormData) {
  const datos = registroSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) volver("/registro", "error", datos.error.issues[0].message);
  const { email, password, nombre, documento, rol } = datos.data;
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { nombre, documento, rol } } });
  if (error) volver("/registro", "error", "No se pudo crear la cuenta: " + error.message);
  volver("/login", "ok", "Cuenta creada. Un administrador debe aprobarla antes de que puedas operar.");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}
