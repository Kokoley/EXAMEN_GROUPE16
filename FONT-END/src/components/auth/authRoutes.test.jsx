import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { ROLES } from "../../constants/roles.js";

vi.mock("../../context/AuthContext.jsx", () => {
  return {
    useAuth: vi.fn()
  };
});

const { useAuth } = await import("../../context/AuthContext.jsx");

function renderWithRoutes(ui, { initialEntries = ["/"] } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe("Auth route guards", () => {
  it("ProtectedRoute shows loader during bootstrapping", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, bootstrapping: true });
    renderWithRoutes(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>PRIVATE</div>} />
        </Route>
      </Routes>
    );
    expect(screen.getByText("Chargement…")).toBeInTheDocument();
  });

  it("ProtectedRoute redirects to /login when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, bootstrapping: false });
    renderWithRoutes(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>PRIVATE</div>} />
        </Route>
        <Route path="/login" element={<div>LOGIN</div>} />
      </Routes>
    );
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
  });

  it("ProtectedRoute renders children when authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, bootstrapping: false });
    renderWithRoutes(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>PRIVATE</div>} />
        </Route>
      </Routes>
    );
    expect(screen.getByText("PRIVATE")).toBeInTheDocument();
  });

  it("RoleRoute redirects to /login when user missing", () => {
    useAuth.mockReturnValue({ user: null });
    renderWithRoutes(
      <Routes>
        <Route element={<RoleRoute allowed={[ROLES.ADMINISTRATEUR]} />}>
          <Route path="/" element={<div>ADMIN</div>} />
        </Route>
        <Route path="/login" element={<div>LOGIN</div>} />
      </Routes>
    );
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
  });

  it("RoleRoute renders outlet when role allowed", () => {
    useAuth.mockReturnValue({ user: { role: ROLES.ADMINISTRATEUR } });
    renderWithRoutes(
      <Routes>
        <Route element={<RoleRoute allowed={[ROLES.ADMINISTRATEUR]} />}>
          <Route path="/" element={<div>ADMIN</div>} />
        </Route>
      </Routes>
    );
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });
});

