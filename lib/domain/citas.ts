// Reglas de las citas de descarga. La base de datos las vuelve a aplicar con un trigger.

export type FranjaConCupo = { id: string; aforo: number; ocupadas: number };

export function cuposDisponibles(f: FranjaConCupo): number {
  return Math.max(0, f.aforo - f.ocupadas);
}

export function hayCupo(f: FranjaConCupo): boolean {
  return cuposDisponibles(f) > 0;
}

// Una cita solo se puede cancelar si sigue reservada y faltan al menos `horasMinimas` horas.
export function puedeCancelar(
  estado: "reservada" | "cancelada" | "ingresada" | "salida",
  inicioFranja: Date,
  ahora: Date,
  horasMinimas = 2,
): boolean {
  if (estado !== "reservada") return false;
  const diferenciaHoras = (inicioFranja.getTime() - ahora.getTime()) / 36e5;
  return diferenciaHoras >= horasMinimas;
}

// Flujo de una cita: reservada -> ingresada -> salida. Cancelada es final.
const SIGUIENTE: Record<string, string[]> = {
  reservada: ["ingresada", "cancelada"],
  ingresada: ["salida"],
  salida: [],
  cancelada: [],
};

export function transicionValida(desde: string, hacia: string): boolean {
  return (SIGUIENTE[desde] ?? []).includes(hacia);
}
