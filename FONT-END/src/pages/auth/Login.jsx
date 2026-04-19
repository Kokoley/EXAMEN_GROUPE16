import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getDashboardPath } from "../../constants/roles.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input, Label } from "../../components/ui/Input.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { useAsyncFn } from "../../hooks/useAsync.js";

export function Login() {
  const { login, isAuthenticated, user, bootstrapping } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, run: submit } = useAsyncFn(login, [login]);

  if (bootstrapping) return <PageLoader />;

  if (isAuthenticated && user) {
    return <Navigate to={from || getDashboardPath(user.role)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dashboard = await submit(email, password);
      toast.success("Connexion réussie");
      const destination = from && from !== "/login" ? from : dashboard;
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(err?.message || "Échec de la connexion");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
            CollectePro
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-2 text-sm text-slate-600">
            Utilisez les identifiants fournis par votre administrateur.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
