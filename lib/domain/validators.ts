import { z } from "zod";
import { ROLES_AUTOREGISTRO } from "./roles";

// RUC peruano: 11 dígitos con dígito verificador (módulo 11).
export function rucValido(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((acc, p, i) => acc + p * Number(ruc[i]), 0);
  const digito = (11 - (suma % 11)) % 10;
  return digito === Number(ruc[10]);
}

export function dniValido(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

// Placa: 3 caracteres, guion, 3 caracteres (por ejemplo ABC-123 o A1B-234).
export function placaValida(placa: string): boolean {
  return /^[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(placa);
}

export const registroSchema = z.object({
  email: z.string().email("Correo no válido"),
  password: z.string().min(8, "La clave debe tener al menos 8 caracteres"),
  nombre: z.string().trim().min(3, "Escribe tu nombre completo").max(80),
  documento: z.string().refine(dniValido, "El DNI debe tener 8 dígitos"),
  rol: z.enum(ROLES_AUTOREGISTRO as unknown as [string, ...string[]], { message: "Rol no permitido" }),
});

export const loginSchema = z.object({
  email: z.string().email("Correo no válido"),
  password: z.string().min(1, "Escribe tu clave"),
});

export const puestoSchema = z.object({
  nombre: z.string().trim().min(3, "Escribe el nombre del puesto").max(80),
  ruc: z.string().refine(rucValido, "RUC no válido"),
  rubro: z.string().trim().min(3, "Escribe el rubro").max(60),
});

export const vehiculoSchema = z.object({
  placa: z
    .string()
    .trim()
    .toUpperCase()
    .refine(placaValida, "La placa debe verse así: ABC-123"),
  tipo: z.string().trim().min(3, "Escribe el tipo de vehículo").max(40),
  capacidad_tn: z.coerce.number().positive("La capacidad debe ser mayor que 0").max(60),
});

export const denunciaSchema = z.object({
  categoria: z.enum(["cobro_ilegal", "salubridad", "acceso", "otro"]),
  descripcion: z.string().trim().min(10, "Cuéntanos qué pasó (mínimo 10 letras)").max(2000),
});

export const estibajeSchema = z.object({
  cita_id: z.string().uuid("Cita no válida"),
  peso_tn: z.coerce.number().positive("El peso debe ser mayor que 0").max(60),
});
