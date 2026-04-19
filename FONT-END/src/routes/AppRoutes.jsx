import { Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "../constants/roles.js";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { RoleRoute } from "../components/auth/RoleRoute.jsx";
import { DashboardLayout } from "../components/layout/DashboardLayout.jsx";
import { Login } from "../pages/auth/Login.jsx";
import { ChefDashboard } from "../pages/chef/ChefDashboard.jsx";
import { NouveauSignalement } from "../pages/chef/NouveauSignalement.jsx";
import { NotificationsPage } from "../pages/chef/NotificationsPage.jsx";
import { AgentDashboard } from "../pages/agent/AgentDashboard.jsx";
import { MissionsPage } from "../pages/agent/MissionsPage.jsx";
import { GpsPage } from "../pages/agent/GpsPage.jsx";
import { OperateurDashboard } from "../pages/operateur/OperateurDashboard.jsx";
import { SignalementsOperateur } from "../pages/operateur/SignalementsOperateur.jsx";
import { OrganiserCollecte } from "../pages/operateur/OrganiserCollecte.jsx";
import { ItinerairePage } from "../pages/operateur/ItinerairePage.jsx";
import { EquipePage } from "../pages/operateur/EquipePage.jsx";
import { AdminDashboard } from "../pages/admin/AdminDashboard.jsx";
import { UtilisateursPage } from "../pages/admin/UtilisateursPage.jsx";
import { SitesPage } from "../pages/admin/SitesPage.jsx";
import { StatistiquesPage } from "../pages/admin/StatistiquesPage.jsx";
import { CamionsPage } from "../pages/admin/CamionsPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/chef-site" element={<DashboardLayout />}>
          <Route element={<RoleRoute allowed={[ROLES.CHEF_SITE]} />}>
            <Route index element={<Navigate to="tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<ChefDashboard />} />
            <Route path="signalement" element={<NouveauSignalement />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        <Route path="/agent" element={<DashboardLayout />}>
          <Route element={<RoleRoute allowed={[ROLES.AGENT_COLLECTEUR]} />}>
            <Route index element={<Navigate to="tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<AgentDashboard />} />
            <Route path="missions" element={<MissionsPage />} />
            <Route path="gps" element={<GpsPage />} />
          </Route>
        </Route>

        <Route path="/operateur" element={<DashboardLayout />}>
          <Route element={<RoleRoute allowed={[ROLES.OPERATEUR]} />}>
            <Route index element={<Navigate to="tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<OperateurDashboard />} />
            <Route path="signalements" element={<SignalementsOperateur />} />
            <Route path="collectes" element={<OrganiserCollecte />} />
            <Route path="itineraire" element={<ItinerairePage />} />
            <Route path="equipe" element={<EquipePage />} />
          </Route>
        </Route>

        <Route path="/admin" element={<DashboardLayout />}>
          <Route element={<RoleRoute allowed={[ROLES.ADMINISTRATEUR]} />}>
            <Route index element={<Navigate to="tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<AdminDashboard />} />
            <Route path="utilisateurs" element={<UtilisateursPage />} />
            <Route path="sites" element={<SitesPage />} />
            <Route path="camions" element={<CamionsPage />} />
            <Route path="statistiques" element={<StatistiquesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
