// Tarifario oficial de estibaje. Los estibadores no pueden cobrar más que esto (adiós a los cupos).

export type Tarifas = { estibaje_base: number; estibaje_por_tn: number };

export const TARIFAS_POR_DEFECTO: Tarifas = { estibaje_base: 15, estibaje_por_tn: 8 };

export function montoEstibaje(pesoTn: number, tarifas: Tarifas = TARIFAS_POR_DEFECTO): number {
  if (!Number.isFinite(pesoTn) || pesoTn <= 0) {
    throw new Error("El peso debe ser mayor que 0");
  }
  const total = tarifas.estibaje_base + tarifas.estibaje_por_tn * pesoTn;
  return Math.round(total * 100) / 100;
}

export function formatoSoles(monto: number): string {
  return "S/ " + monto.toFixed(2);
}
