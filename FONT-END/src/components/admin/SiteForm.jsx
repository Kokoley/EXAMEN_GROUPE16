import { Label, Input, Textarea } from "../ui/Input.jsx";

export function SiteForm({ values, onChange, disabled }) {
  const id = (name) => `site-form-${name}`;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={id("nom")}>Nom du site</Label>
        <Input
          id={id("nom")}
          value={values.nom}
          onChange={(e) => onChange("nom", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div>
        <Label htmlFor={id("localisation")}>Localisation</Label>
        <Input
          id={id("localisation")}
          value={values.localisation}
          onChange={(e) => onChange("localisation", e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <div>
        <Label htmlFor={id("description")}>Description</Label>
        <Textarea
          id={id("description")}
          rows={4}
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          disabled={disabled}
          placeholder="Informations complémentaires sur le site…"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id={id("actif")}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={values.actif}
          onChange={(e) => onChange("actif", e.target.checked)}
          disabled={disabled}
        />
        <Label htmlFor={id("actif")} className="!mt-0 font-normal">
          Site actif
        </Label>
      </div>
    </div>
  );
}

export function emptySiteForm() {
  return {
    nom: "",
    localisation: "",
    description: "",
    actif: true
  };
}

export function siteToFormValues(site) {
  return {
    nom: site.nom ?? "",
    localisation: site.localisation ?? site.adresse ?? "",
    description: site.description ?? "",
    actif: site.actif !== false
  };
}
