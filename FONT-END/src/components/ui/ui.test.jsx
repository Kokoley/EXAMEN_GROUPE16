import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button.jsx";
import { Card, CardTitle } from "./Card.jsx";
import { Input, Label, Select, Textarea } from "./Input.jsx";
import { PageLoader, Spinner } from "./Spinner.jsx";

describe("UI components", () => {
  it("Button renders children", () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("Card + CardTitle render", () => {
    render(
      <Card>
        <CardTitle>Titre</CardTitle>
        <div>Contenu</div>
      </Card>
    );
    expect(screen.getByText("Titre")).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("Input/Label/Select/Textarea render", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" defaultValue="a@b.c" />
        <Select id="role" defaultValue="x">
          <option value="x">X</option>
        </Select>
        <Textarea id="desc" defaultValue="hello" />
      </div>
    );
    expect(screen.getByLabelText("Email")).toHaveValue("a@b.c");
    expect(screen.getByDisplayValue("X")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
  });

  it("Spinner and PageLoader expose status", () => {
    render(
      <div>
        <Spinner label="Chargement…" />
        <PageLoader />
      </div>
    );
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Chargement…").length).toBeGreaterThan(0);
  });
});

