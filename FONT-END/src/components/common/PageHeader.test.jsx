import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader.jsx";

describe("PageHeader", () => {
  it("renders title/subtitle and action", () => {
    render(
      <PageHeader
        title="Titre"
        subtitle="Sous-titre"
        action={<button type="button">Action</button>}
      />
    );
    expect(screen.getByText("Titre")).toBeInTheDocument();
    expect(screen.getByText("Sous-titre")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});

