import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, MapPin, Calendar, CheckCircle2, Shield, ShieldCheck, CarFront, User, Info, ArrowLeft } from "lucide-react";
import { ApiService } from "../services/api";
import { Car } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState<"rental" | "reservation" | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [requestType, setRequestType] = useState<"rental" | "reservation" | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!id) return;
    ApiService.getCarById(id)
      .then((data) => {
        setCar(data);
        setActiveImage(0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotal = () => {
    if (!car) return 0;
    return calculateDays() * car.pricePerDay;
  };

  const handleAction = async (type: "rental" | "reservation") => {
    if (!startDate || !endDate || !car || !user) return;
    setSubmitting(type);
    setActionError("");
    try {
      const result = await ApiService.createReservation({
        carId: car.id,
        startDate,
        endDate,
        totalPrice: Number((calculateTotal() * 1.05).toFixed(2)),
        type
      });
      setRequestType(type);
      setShowInvoice(true);
      setCar({ ...car, available: false });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erreur lors de l'operation.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-blue-600">Chargement...</div>;
  }

  if (!car) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Vehicule introuvable</h2>
      <Link to="/cars" className="text-blue-600 hover:underline">Retour aux resultats</Link>
    </div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {car.category}
                </span>
                <span className="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-2 py-0.5 rounded">
                  <Star className="w-4 h-4 fill-current mr-1" /> {car.rating.toFixed(1)}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {car.make} {car.model} <span className="text-gray-400 font-medium ml-2">{car.year}</span>
              </h1>
              <p className="flex items-center text-gray-500 mt-2 font-medium">
                <MapPin className="w-4 h-4 mr-1.5" /> {car.location}, Cameroun
              </p>
              <p className="mt-2 text-sm text-gray-700">
                Proprietaire: <span className="font-semibold">{car.ownerName}</span>
              </p>
            </div>

            <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Prix de location</div>
              <div className="text-3xl font-extrabold text-blue-600">{car.pricePerDay.toLocaleString('fr-CM')} <span className="text-lg text-gray-500 font-medium">FCFA/jour</span></div>
              <div className={`mt-2 text-sm font-semibold ${car.available ? 'text-green-600' : 'text-red-600'}`}>
                {car.available ? "Disponible" : "Indisponible"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4">
              <div className="h-[280px] md:h-[440px] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <ImageWithFallback src={car.images[activeImage] || car.images[0]} alt={car.model} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {car.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-20 rounded-xl overflow-hidden border-2 ${activeImage === index ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <ImageWithFallback src={image} alt={`${car.make} ${car.model} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Caracteristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <User className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Places</span>
                  <span className="font-bold text-gray-900">{car.seats}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CarFront className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Boite</span>
                  <span className="font-bold text-gray-900">{car.transmission}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Disponibilite</span>
                  <span className="font-bold text-gray-900">{car.available ? "Oui" : "Non"}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Shield className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Assurance</span>
                  <span className="font-bold text-gray-900">Incluse</span>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  Vehicule en bon etat, propose par {car.ownerName}. Une facture est generee pour toute location ou reservation, et le proprietaire recoit automatiquement une notification dans son dashboard.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold border-2 border-white shadow-md">
                  {car.ownerName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{car.ownerName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Proprietaire verifie
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{car.ownerEmail}</span>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Louer ou reserver
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de depart</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de retour</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>

                {startDate && endDate && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 my-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                      <span>{car.pricePerDay.toLocaleString('fr-CM')} FCFA x {calculateDays()} jour(s)</span>
                      <span>{calculateTotal().toLocaleString('fr-CM')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4 font-medium">
                      <span>Frais de service (5%)</span>
                      <span>{(calculateTotal() * 0.05).toLocaleString('fr-CM')} FCFA</span>
                    </div>
                    <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total TTC</span>
                      <span className="text-xl font-extrabold text-blue-700">
                        {(calculateTotal() * 1.05).toLocaleString('fr-CM')} FCFA
                      </span>
                    </div>
                  </div>
                )}

                {actionError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {actionError}
                  </div>
                )}

                {user ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={submitting !== null || !startDate || !endDate || !car.available}
                      onClick={() => handleAction("rental")}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition-all shadow-md"
                    >
                      {submitting === "rental" ? "Traitement..." : "Louer maintenant"}
                    </button>
                    <button
                      type="button"
                      disabled={submitting !== null || !startDate || !endDate || !car.available}
                      onClick={() => handleAction("reservation")}
                      className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition-all shadow-md"
                    >
                      {submitting === "reservation" ? "Traitement..." : "Faire une reservation"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold rounded-xl py-3.5 transition-all shadow-md"
                  >
                    Connectez-vous pour continuer
                  </button>
                )}

                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Une facture est creee dans les deux cas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && requestType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Demande envoyee</h2>
              <p className="text-gray-500 mt-2">Le proprietaire a ete notifie. La facture sera creee apres acceptation puis envoyee par email.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Facture</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Type :</span> <span>{requestType === "rental" ? "Location" : "Reservation"}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Locataire :</span> <span>{user?.name}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Proprietaire :</span> <span>{car.ownerName}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Vehicule :</span> <span>{car.make} {car.model}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Periode :</span> <span>Du {new Date(startDate).toLocaleDateString()} au {new Date(endDate).toLocaleDateString()}</span></div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between"><span>Montant location :</span> <span>{calculateTotal().toLocaleString('fr-CM')} FCFA</span></div>
                  <div className="flex justify-between"><span>Frais service :</span> <span>{(calculateTotal() * 0.05).toLocaleString('fr-CM')} FCFA</span></div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <span>Total TTC :</span> <span className="text-blue-600">{(calculateTotal() * 1.05).toLocaleString('fr-CM')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowInvoice(false);
                navigate('/dashboard/renter');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Aller au dashboard locataire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
