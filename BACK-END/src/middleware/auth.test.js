import { describe, expect, it } from "vitest";
import { parseAuthUser } from "./auth.js";
import { makeTestJwt } from "../test/testUtils.js";

describe("parseAuthUser", () => {
  it("returns null when missing header", () => {
    expect(parseAuthUser({ headers: {} })).toBeNull();
  });

  it("returns null for invalid token", () => {
    const req = { headers: { authorization: "Bearer real.token" } };
    expect(parseAuthUser(req)).toBeNull();
  });

  it("parses a JWT token", () => {
    const token = makeTestJwt({ sub: 12, role: "OPERATEUR" });
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(parseAuthUser(req)).toEqual({ id: 12, role: "OPERATEUR" });
  });
});

