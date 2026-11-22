import { describe, expect, it } from "vitest";
import { cuposDisponibles, hayCupo, puedeCancelar, transicionValida } from "../lib/domain/citas";
import { formatoSoles, montoEstibaje } from "../lib/domain/tarifario";
import { calcularSemaforo, type Checklist } from "../lib/domain/semaforo";

describe("citas y aforo", () => {
  it("calcula los cupos y nunca baja de cero", () => {
    expect(cuposDisponibles({ id: "f1", aforo: 4, ocupadas: 1 })).toBe(3);
    expect(cuposDisponibles({ id: "f1", aforo: 4, ocupadas: 9 })).toBe(0);
  });

  it("una franja llena no tiene cupo", () => {
    expect(hayCupo({ id: "f1", aforo: 2, ocupadas: 2 })).toBe(false);
    expect(hayCupo({ id: "f1", aforo: 2, ocupadas: 1 })).toBe(true);
  });

  it("solo se cancela una cita reservada con 2 horas de anticipación", () => {
    const inicio = new Date("2026-12-10T08:00:00Z");
    expect(puedeCancelar("reservada", inicio, new Date("2026-12-10T05:00:00Z"))).toBe(true);
    expect(puedeCancelar("reservada", inicio, new Date("2026-12-10T07:00:00Z"))).toBe(false);
    expect(puedeCancelar("ingresada", inicio, new Date("2026-12-09T08:00:00Z"))).toBe(false);
  });

  it("el flujo de la cita sigue el orden reservada, ingresada, salida", () => {
    expect(transicionValida("reservada", "ingresada")).toBe(true);
    expect(transicionValida("ingresada", "salida")).toBe(true);
    expect(transicionValida("reservada", "salida")).toBe(false);
    expect(transicionValida("cancelada", "ingresada")).toBe(false);
  });
});

describe("tarifario oficial de estibaje", () => {
  it("cobra la base más el costo por tonelada", () => {
    expect(montoEstibaje(2)).toBe(31);
    expect(montoEstibaje(2.5, { estibaje_base: 10, estibaje_por_tn: 6 })).toBe(25);
  });

  it("redondea a dos decimales", () => {
    expect(montoEstibaje(1.333, { estibaje_base: 0, estibaje_por_tn: 1 })).toBe(1.33);
  });

  it("rechaza pesos inválidos", () => {
    expect(() => montoEstibaje(0)).toThrow();
    expect(() => montoEstibaje(-3)).toThrow();
    expect(() => montoEstibaje(Number.NaN)).toThrow();
  });

  it("da formato en soles", () => {
    expect(formatoSoles(31)).toBe("S/ 31.00");
  });
});

describe("semáforo sanitario", () => {
  const todoBien: Checklist = { limpieza: true, cadena_frio: true, plagas: true, residuos: true, higiene_personal: true };

  it("verde si cumple todo", () => {
    expect(calcularSemaforo(todoBien)).toBe("verde");
  });

  it("ámbar si solo falla un criterio no crítico", () => {
    expect(calcularSemaforo({ ...todoBien, limpieza: false })).toBe("ambar");
  });

  it("rojo si falla un criterio crítico", () => {
    expect(calcularSemaforo({ ...todoBien, plagas: false })).toBe("rojo");
    expect(calcularSemaforo({ ...todoBien, cadena_frio: false, limpieza: false })).toBe("rojo");
  });
});
