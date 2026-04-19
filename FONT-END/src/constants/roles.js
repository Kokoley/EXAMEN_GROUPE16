export const ROLES = {
  CHEF_SITE: "CHEF_SITE",
  AGENT_COLLECTEUR: "AGENT_COLLECTEUR",
  OPERATEUR: "OPERATEUR",
  ADMINISTRATEUR: "ADMINISTRATEUR"
};

export const ROLE_LABELS = {
  [ROLES.CHEF_SITE]: "Chef de site",
  [ROLES.AGENT_COLLECTEUR]: "Agent collecteur",
  [ROLES.OPERATEUR]: "Opérateur",
  [ROLES.ADMINISTRATEUR]: "Administrateur"
};

export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.CHEF_SITE:
      return "/chef-site/tableau-de-bord";
    case ROLES.AGENT_COLLECTEUR:
      return "/agent/tableau-de-bord";
    case ROLES.OPERATEUR:
      return "/operateur/tableau-de-bord";
    case ROLES.ADMINISTRATEUR:
      return "/admin/tableau-de-bord";
    default:
      return "/login";
  }
};
