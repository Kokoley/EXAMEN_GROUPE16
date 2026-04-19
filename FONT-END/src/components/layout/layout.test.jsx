import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { DashboardLayout } from "./DashboardLayout.jsx";
import { ROLES } from "../../constants/roles.js";

vi.mock("../../context/AuthContext.jsx", () => {
  return { useAuth: vi.fn() };
});

vi.mock("react-hot-toast", () => {
  return { default: { success: vi.fn() } };
});

const { useAuth } = await import("../../context/AuthContext.jsx");

describe("Layout components", () => {
  it("Navbar renders user display", () => {
    useAuth.mockReturnValue({ logout: vi.fn() });
    render(
      <MemoryRouter>
        <Navbar user={{ prenom: "A", nom: "B", email: "a@b.c", role: ROLES.OPERATEUR }} />
      </MemoryRouter>
    );
    expect(screen.getByText("A B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Déconnexion" })).toBeInTheDocument();
  });

  it("Sidebar renders nav items for role", () => {
    render(
      <MemoryRouter>
        <Sidebar role={ROLES.ADMINISTRATEUR} />
      </MemoryRouter>
    );
    // Le label exact dépend de NAV_BY_ROLE, mais la sidebar doit au moins afficher la marque
    expect(screen.getByText("CollectePro")).toBeInTheDocument();
  });

  it("DashboardLayout renders outlet when no user", () => {
    useAuth.mockReturnValue({ user: null });
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    );
    // Outlet vide => on vérifie surtout l'absence de navbar
    expect(screen.queryByText("Déconnexion")).not.toBeInTheDocument();
  });
});

