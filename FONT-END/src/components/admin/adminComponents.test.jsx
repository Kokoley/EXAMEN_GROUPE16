import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminModal } from "./AdminModal.jsx";
import { AdminTableShell } from "./AdminTableShell.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { emptySiteForm, SiteForm } from "./SiteForm.jsx";
import { emptyUserForm, UserForm } from "./UserForm.jsx";
import { ROLES } from "../../constants/roles.js";

describe("Admin components", () => {
  it("AdminTableShell renders table children", () => {
    render(
      <AdminTableShell>
        <tbody>
          <tr>
            <td>Row</td>
          </tr>
        </tbody>
      </AdminTableShell>
    );
    expect(screen.getByText("Row")).toBeInTheDocument();
  });

  it("AdminModal renders when open", () => {
    const onClose = vi.fn();
    render(
      <AdminModal open title="Modal" onClose={onClose} footer={<div>Footer</div>}>
        <div>Body</div>
      </AdminModal>
    );
    expect(screen.getByText("Modal")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("ConfirmDialog calls onCancel", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Confirmer"
        message="Message"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("SiteForm triggers onChange", () => {
    const onChange = vi.fn();
    const values = emptySiteForm();
    render(<SiteForm values={values} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Nom du site"), { target: { value: "X" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("UserForm renders role options", () => {
    const values = emptyUserForm();
    render(
      <UserForm
        mode="create"
        values={{ ...values, role: ROLES.OPERATEUR }}
        onChange={() => {}}
        sites={[]}
      />
    );
    expect(screen.getByLabelText("Rôle")).toBeInTheDocument();
    expect(screen.getByText("Opérateur")).toBeInTheDocument();
  });
});

