import { describe, expect, it } from "vitest";
import { ROLES, ROLES_AUTOREGISTRO, can, esRol, rutaPermitida, type Accion } from "../lib/domain/roles";

describe("permisos por rol (pruebas de autorización)", () => {
  it("el administrador aprueba el padrón y ve la bitácora; nadie más", () => {
    for (const rol of ROLES) {
      expect(can(rol, "padron:aprobar")).toBe(rol === "administrador");
      expect(can(rol, "bitacora:ver")).toBe(rol === "administrador");
      expect(can(rol, "denuncia:ver")).toBe(rol === "administrador");
    }
  });

  it("solo el transportista reserva y cancela citas", () => {
    for (const rol of ROLES) {
      expect(can(rol, "cita:reservar")).toBe(rol === "transportista");
      expect(can(rol, "cita:cancelar")).toBe(rol === "transportista");
    }
  });

  it("solo el inspector registra inspecciones", () => {
    for (const rol of ROLES) expect(can(rol, "inspeccion:registrar")).toBe(rol === "inspector");
  });

  it("un estibador no puede cobrar por su cuenta ni registrar ingresos", () => {
    const prohibidas: Accion[] = ["cita:registrar_ingreso", "padron:aprobar", "estibaje:solicitar"];
    for (const a of prohibidas) expect(can("estibador", a)).toBe(false);
  });

  it("sin sesión no se puede hacer nada", () => {
    expect(can(null, "cita:reservar")).toBe(false);
    expect(can(undefined, "padron:aprobar")).toBe(false);
  });
});

describe("rutas protegidas", () => {
  it("/admin es solo del administrador", () => {
    expect(rutaPermitida("administrador", "/admin/padron")).toBe(true);
    expect(rutaPermitida("comerciante", "/admin/padron")).toBe(false);
    expect(rutaPermitida(null, "/admin")).toBe(false);
  });

  it("un rol no entra a las pantallas de otro", () => {
    expect(rutaPermitida("estibador", "/citas")).toBe(false);
    expect(rutaPermitida("transportista", "/inspeccion")).toBe(false);
    expect(rutaPermitida("inspector", "/inspeccion/nueva")).toBe(true);
  });

  it("las rutas públicas quedan abiertas", () => {
    expect(rutaPermitida(null, "/denuncia")).toBe(true);
    expect(rutaPermitida(null, "/login")).toBe(true);
  });

  it("un prefijo parecido no cuenta (/administrador no es /admin)", () => {
    expect(rutaPermitida(null, "/administrador")).toBe(true);
  });
});

describe("registro", () => {
  it("no se puede elegir administrador, inspector ni acceso al registrarse", () => {
    expect(ROLES_AUTOREGISTRO).not.toContain("administrador");
    expect(ROLES_AUTOREGISTRO).not.toContain("inspector");
    expect(ROLES_AUTOREGISTRO).not.toContain("acceso");
  });

  it("esRol valida textos desconocidos", () => {
    expect(esRol("administrador")).toBe(true);
    expect(esRol("superadmin")).toBe(false);
    expect(esRol(42)).toBe(false);
  });
});
