import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input, Label } from "../../components/ui/Input.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { sendPosition } from "../../services/gpsService.js";

function parseCoord(value) {
  const n = parseFloat(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export function GpsPage() {
  const { user } = useAuth();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);

  const lireGps = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation indisponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        toast.success("Position lue");
      },
      () => toast.error("Impossible d’obtenir la position"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lat = parseCoord(latitude);
    const lng = parseCoord(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Coordonnées invalides");
      return;
    }
    setLoading(true);
    try {
      await sendPosition(user.id, lat, lng);
      toast.success("Position transmise au centre");
    } catch (err) {
      toast.error(err?.message || "Envoi impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Position GPS"
        subtitle="Envoyez votre position pour le suivi des missions (connecté avec votre compte agent)."
      />
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                inputMode="decimal"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="5.35"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                inputMode="decimal"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-4.02"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={lireGps}>
              Lire GPS du navigateur
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4 text-white" />
                  Envoi…
                </span>
              ) : (
                "Envoyer la position"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
