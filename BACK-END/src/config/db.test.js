import { describe, expect, it } from "vitest";
import { formatDbError } from "./db.js";

describe("formatDbError", () => {
  it("returns generic message for falsy error", () => {
    expect(formatDbError(null)).toBe("Erreur inconnue");
  });

  it("prefers sqlMessage", () => {
    expect(formatDbError({ sqlMessage: "bad sql" })).toBe("bad sql");
  });

  it("falls back to message", () => {
    expect(formatDbError({ message: "oops" })).toBe("oops");
  });

  it("falls back to error code", () => {
    expect(formatDbError({ code: "ECONNREFUSED" })).toBe("Code erreur: ECONNREFUSED");
  });
});

