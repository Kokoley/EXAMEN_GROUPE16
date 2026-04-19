import { Input, Label } from "../ui/Input.jsx";

export function CamionForm({ values, onChange, disabled }) {
  const id = (name) => `camion-form-${name}`;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={id("immatriculation")}>Immatriculation</Label>
        <Input
          id={id("immatriculation")}
          value={values.immatriculation}
          onChange={(e) => onChange("immatriculation", e.target.value)}
          disabled={disabled}
          required
          placeholder="GO-001-CD"
        />
      </div>
      <div>
        <Label htmlFor={id("libelle")}>Libellé (optionnel)</Label>
        <Input
          id={id("libelle")}
          value={values.libelle}
          onChange={(e) => onChange("libelle", e.target.value)}
          disabled={disabled}
          placeholder="Compacteur 12 m³"
        />
      </div>
    </div>
  );
}

export function emptyCamionForm() {
  return { immatriculation: "", libelle: "" };
}

export function camionToFormValues(camion) {
  return {
    immatriculation: camion.immatriculation ?? "",
    libelle: camion.libelle ?? ""
  };
}

