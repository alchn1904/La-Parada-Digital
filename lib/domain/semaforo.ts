// Semáforo sanitario de un puesto a partir del checklist de la inspección.

export const CRITERIOS = [
  { clave: "limpieza", texto: "Limpieza del puesto y de los utensilios", critico: false },
  { clave: "cadena_frio", texto: "Cadena de frío en productos perecibles", critico: true },
  { clave: "plagas", texto: "Ausencia de plagas", critico: true },
  { clave: "residuos", texto: "Manejo adecuado de residuos", critico: false },
  { clave: "higiene_personal", texto: "Higiene del personal", critico: false },
] as const;

export type Checklist = Record<(typeof CRITERIOS)[number]["clave"], boolean>;
export type Semaforo = "verde" | "ambar" | "rojo";

// Rojo: falla algún criterio crítico. Ámbar: falla algún criterio no crítico. Verde: cumple todo.
export function calcularSemaforo(checklist: Checklist): Semaforo {
  const fallas = CRITERIOS.filter((c) => !checklist[c.clave]);
  if (fallas.some((c) => c.critico)) return "rojo";
  if (fallas.length > 0) return "ambar";
  return "verde";
}
