import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input, Label, Textarea } from "../../components/ui/Input.jsx";
import { Spinner } from "../../components/ui/Spinner.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { postSignalement } from "../../services/signalementService.js";
import { useAsyncFn } from "../../hooks/useAsync.js";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function NouveauSignalement() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const { loading, run: submit } = useAsyncFn(
    (body) => postSignalement(body, user.id),
    [user.id]
  );

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée par le navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        toast.success("Position enregistrée");
      },
      () => toast.error("Impossible d’obtenir la position."),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoUrl(dataUrl);
      toast.success("Photo chargée");
    } catch {
      toast.error("Lecture du fichier impossible");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Indiquez une localisation valide ou utilisez le GPS.");
      return;
    }
    try {
      await submit({
        description,
        photoUrl,
        latitude: lat,
        longitude: lng,
        siteId: user.siteId ?? undefined
      });
      toast.success("Signalement envoyé");
      setDescription("");
      setPhotoUrl(null);
      setLatitude("");
      setLongitude("");
    } catch (err) {
      toast.error(err?.message || "Échec de l’envoi");
    }
  };

  return (
    <div>
      <PageHeader
        title="Nouveau signalement"
        subtitle="Décrivez le problème, ajoutez une photo et la localisation."
      />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nature du déchet, volume, accès, etc."
            />
          </div>
          <div>
            <Label htmlFor="photo">Photo (optionnel)</Label>
            <Input id="photo" type="file" accept="image/*" onChange={onFile} />
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Aperçu"
                className="mt-3 max-h-48 rounded-lg border border-slate-100 object-contain"
              />
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                inputMode="decimal"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="ex. 5.36"
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                inputMode="decimal"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="ex. -4.01"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={captureLocation}>
              Utiliser ma position GPS
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4 text-white" />
                  Envoi…
                </span>
              ) : (
                "Envoyer le signalement"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
