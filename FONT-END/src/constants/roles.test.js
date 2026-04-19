import { describe, expect, it } from "vitest";
import { getDashboardPath, ROLES, ROLE_LABELS } from "./roles.js";

describe("getDashboardPath", () => {
  it("renvoie le chemin du tableau de bord pour chaque rôle", () => {
    expect(getDashboardPath(ROLES.CHEF_SITE)).toBe("/chef-site/tableau-de-bord");
    expect(getDashboardPath(ROLES.AGENT_COLLECTEUR)).toBe("/agent/tableau-de-bord");
    expect(getDashboardPath(ROLES.OPERATEUR)).toBe("/operateur/tableau-de-bord");
    expect(getDashboardPath(ROLES.ADMINISTRATEUR)).toBe("/admin/tableau-de-bord");
  });

  it("renvoie /login pour un rôle inconnu", () => {
    expect(getDashboardPath("INCONNU")).toBe("/login");
  });
});

describe("ROLE_LABELS", () => {
  it("définit un libellé pour chaque rôle", () => {
    Object.values(ROLES).forEach((role) => {
      expect(ROLE_LABELS[role]).toBeTruthy();
    });
  });
});
