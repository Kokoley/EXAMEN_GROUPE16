import { ROLES, ROLE_LABELS } from "../../constants/roles.js";
import { Label, Input, Select } from "../ui/Input.jsx";

const ROLE_OPTIONS = [
  ROLES.CHEF_SITE,
  ROLES.AGENT_COLLECTEUR,
  ROLES.OPERATEUR,
  ROLES.ADMINISTRATEUR
];

export function UserForm({ mode, values, onChange, sites, disabled }) {
  const id = (name) => `user-form-${name}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={id("prenom")}>Prénom</Label>
          <Input
            id={id("prenom")}
            value={values.prenom}
            onChange={(e) => onChange("prenom", e.target.value)}
            disabled={disabled}
            autoComplete="given-name"
            required
          />
        </div>
        <div>
          <Label htmlFor={id("nom")}>Nom</Label>
          <Input
            id={id("nom")}
            value={values.nom}
            onChange={(e) => onChange("nom", e.target.value)}
            disabled={disabled}
            autoComplete="family-name"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor={id("email")}>Email</Label>
        <Input
          id={id("email")}
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          disabled={disabled}
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor={id("password")}>
          Mot de passe {mode === "edit" ? "(optionnel)" : ""}
        </Label>
        <Input
          id={id("password")}
          type="password"
          value={values.password}
          onChange={(e) => onChange("password", e.target.value)}
          disabled={disabled}
          autoComplete={mode === "create" ? "new-password" : "new-password"}
          placeholder={mode === "edit" ? "Laisser vide pour conserver l’actuel" : ""}
          required={mode === "create"}
        />
      </div>
      <div>
        <Label htmlFor={id("role")}>Rôle</Label>
        <Select
          id={id("role")}
          value={values.role}
          onChange={(e) => onChange("role", e.target.value)}
          disabled={disabled}
          required
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r] ?? r}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor={id("siteId")}>Site associé</Label>
        <Select
          id={id("siteId")}
          value={values.siteId === null || values.siteId === undefined ? "" : String(values.siteId)}
          onChange={(e) => onChange("siteId", e.target.value === "" ? "" : e.target.value)}
          disabled={disabled}
        >
          <option value="">— Non affecté —</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nom}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function emptyUserForm() {
  return {
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: ROLES.AGENT_COLLECTEUR,
    siteId: ""
  };
}

export function userToFormValues(user) {
  return {
    prenom: user.prenom ?? "",
    nom: user.nom ?? "",
    email: user.email ?? "",
    password: "",
    role: user.role ?? ROLES.AGENT_COLLECTEUR,
    siteId: user.siteId == null ? "" : String(user.siteId)
  };
}
