import { describe, expect, it } from "vitest";
import { denunciaSchema, dniValido, placaValida, puestoSchema, registroSchema, rucValido, vehiculoSchema } from "../lib/domain/validators";

// Construye un RUC válido a partir de 10 dígitos.
function rucConDigito(base: string): string {
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((acc, p, i) => acc + p * Number(base[i]), 0);
  return base + String((11 - (suma % 11)) % 10);
}

describe("RUC, DNI y placa", () => {
  it("acepta un RUC con dígito verificador correcto", () => {
    expect(rucValido(rucConDigito("2010007097"))).toBe(true);
  });

  it("rechaza un RUC con dígito verificador incorrecto o formato raro", () => {
    const bueno = rucConDigito("2010007097");
    const malo = bueno.slice(0, 10) + String((Number(bueno[10]) + 1) % 10);
    expect(rucValido(malo)).toBe(false);
    expect(rucValido("123")).toBe(false);
    expect(rucValido("2010007097A")).toBe(false);
  });

  it("DNI de 8 dígitos", () => {
    expect(dniValido("12345678")).toBe(true);
    expect(dniValido("1234567")).toBe(false);
    expect(dniValido("1234567a")).toBe(false);
  });

  it("placa con formato ABC-123", () => {
    expect(placaValida("ABC-123")).toBe(true);
    expect(placaValida("A1B-2C3")).toBe(true);
    expect(placaValida("abc-123")).toBe(false);
    expect(placaValida("ABC123")).toBe(false);
  });
});

describe("esquemas de formularios", () => {
  it("el registro no permite el rol administrador", () => {
    const r = registroSchema.safeParse({ email: "a@b.com", password: "12345678", nombre: "Ana Pérez", documento: "12345678", rol: "administrador" });
    expect(r.success).toBe(false);
  });

  it("el registro acepta un transportista válido", () => {
    const r = registroSchema.safeParse({ email: "a@b.com", password: "12345678", nombre: "Ana Pérez", documento: "12345678", rol: "transportista" });
    expect(r.success).toBe(true);
  });

  it("el puesto exige un RUC válido", () => {
    expect(puestoSchema.safeParse({ nombre: "Frutas Rosa", ruc: "11111111111", rubro: "Frutas" }).success).toBe(false);
    expect(puestoSchema.safeParse({ nombre: "Frutas Rosa", ruc: rucConDigito("2010007097"), rubro: "Frutas" }).success).toBe(true);
  });

  it("el vehículo normaliza la placa a mayúsculas", () => {
    const r = vehiculoSchema.parse({ placa: " abc-123 ", tipo: "Camión", capacidad_tn: "8.5" });
    expect(r.placa).toBe("ABC-123");
    expect(r.capacidad_tn).toBe(8.5);
  });

  it("la denuncia pide una descripción mínima", () => {
    expect(denunciaSchema.safeParse({ categoria: "cobro_ilegal", descripcion: "corto" }).success).toBe(false);
    expect(denunciaSchema.safeParse({ categoria: "cobro_ilegal", descripcion: "Me cobraron un cupo en el andén 3" }).success).toBe(true);
  });
});
