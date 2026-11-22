"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requerirRol } from "@/lib/auth";
import { vehiculoSchema } from "@/lib/domain/validators";
import { puedeCancelar } from "@/lib/domain/citas";

function volver(clave: "error" | "ok", mensaje: string): never {
  redirect("/citas?" + clave + "=" + encodeURIComponent(mensaje));
}

export async function registrarVehiculo(formData: FormData) {
  const { supabase, perfil } = await requerirRol("transportista");
  const datos = vehiculoSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) volver("error", datos.error.issues[0].message);
  const { error } = await supabase.from("vehiculos").insert({ ...datos.data, transportista_id: perfil.id });
  if (error) volver("error", error.code === "23505" ? "Esa placa ya está registrada" : "No se pudo registrar el vehículo");
  revalidatePath("/citas");
  volver("ok", "Vehículo registrado");
}

export async function reservarCita(formData: FormData) {
  const { supabase, perfil } = await requerirRol("transportista");
  const franja_id = String(formData.get("franja_id") ?? "");
  const vehiculo_id = String(formData.get("vehiculo_id") ?? "");
  if (!franja_id || !vehiculo_id) volver("error", "Elige un vehículo y una franja");
  const { error } = await supabase.from("citas").insert({ franja_id, vehiculo_id, transportista_id: perfil.id });
  if (error) {
    // El trigger de aforo responde con este texto cuando la franja ya no tiene cupos.
    const mensaje = error.message.includes("cupos") ? "La franja ya no tiene cupos" : error.code === "23505" ? "Ese vehículo ya tiene cita en esa franja" : "No se pudo reservar la cita";
    volver("error", mensaje);
  }
  revalidatePath("/citas");
  volver("ok", "Cita reservada");
}

export async function cancelarCita(formData: FormData) {
  const { supabase } = await requerirRol("transportista");
  const id = String(formData.get("cita_id") ?? "");
  const { data: cita } = await supabase.from("citas").select("estado, franjas(fecha, hora_inicio)").eq("id", id).single();
  const franja = Array.isArray(cita?.franjas) ? cita?.franjas[0] : cita?.franjas;
  if (!cita || !franja) volver("error", "Cita no encontrada");
  const inicio = new Date(franja.fecha + "T" + franja.hora_inicio);
  if (!puedeCancelar(cita.estado, inicio, new Date())) volver("error", "Solo puedes cancelar con 2 horas de anticipación");
  const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
  if (error) volver("error", "No se pudo cancelar la cita");
  revalidatePath("/citas");
  volver("ok", "Cita cancelada");
}
