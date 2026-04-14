import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, MapPin, Calendar, CheckCircle2, Shield, ShieldCheck, CarFront, User, Info, ArrowLeft } from "lucide-react";
import { ApiService } from "../services/api";
import { Car } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reservation Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      ApiService.getCarById(id).then(data => {
        if (data) setCar(data);
        setLoading(false);
      });
    }
  }, [id]);

  const calculateTotal = () => {
    if (!startDate || !endDate || !car) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * car.pricePerDay : car.pricePerDay;
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !car || !user) return;
    
    setSubmitting(true);
    try {
      const res = await ApiService.createReservation({
        carId: car.id,
        renterId: user.id,
        startDate,
        endDate,
        totalPrice: calculateTotal() * 1.05
      });
      // Générer la facture et l'afficher
      setInvoiceData({
        reservationId: res.id,
        carName: `${car.make} ${car.model}`,
        renterName: user.name,
        renterEmail: user.email,
        startDate,
        endDate,
        amountNet: calculateTotal(),
        fee: calculateTotal() * 0.05,
        total: calculateTotal() * 1.05,
        date: new Date().toLocaleDateString('fr-FR')
      });
      setShowInvoice(true);
    } catch (error) {
      alert("Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-blue-600">Chargement...</div>;
  }

  if (!car) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Véhicule introuvable</h2>
      <Link to="/cars" className="text-blue-600 hover:underline">Retour aux résultats</Link>
    </div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Banner */}
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
                  <Star className="w-4 h-4 fill-current mr-1" /> {car.rating} (12 avis)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {car.make} {car.model} <span className="text-gray-400 font-medium ml-2">{car.year}</span>
              </h1>
              <p className="flex items-center text-gray-500 mt-2 font-medium">
                <MapPin className="w-4 h-4 mr-1.5" /> {car.location}, Cameroun
              </p>
            </div>
            
            <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Prix de location</div>
              <div className="text-3xl font-extrabold text-blue-600">{car.pricePerDay.toLocaleString('fr-CM')} <span className="text-lg text-gray-500 font-medium">FCFA/jour</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Images + Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px] md:h-[500px]">
              <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <User className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Places</span>
                  <span className="font-bold text-gray-900">{car.seats}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CarFront className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Boîte</span>
                  <span className="font-bold text-gray-900">{car.transmission}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500">Climatisation</span>
                  <span className="font-bold text-gray-900">Oui</span>
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
                  Véhicule en excellent état, régulièrement entretenu. Idéal pour vos déplacements professionnels à {car.location} ou pour des séjours en famille. La location inclut une assurance tous risques et une assistance 24/7. Le véhicule est livré propre avec le plein, merci de le rendre dans le même état.
                </p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold border-2 border-white shadow-md">
                  PR
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Propriétaire Vérifié</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Identité vérifiée
                  </p>
                </div>
              </div>
              <button className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors text-sm">
                Voir le profil
              </button>
            </div>
          </div>

          {/* Reservation Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Réserver ce véhicule
              </h2>

              <form onSubmit={handleReserve} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de départ</label>
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
                      <span>{car.pricePerDay.toLocaleString('fr-CM')} FCFA x {Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1} jour(s)</span>
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

                {user ? (
                  <button
                    type="submit"
                    disabled={submitting || !startDate || !endDate}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                  >
                    {submitting ? "Traitement..." : "Demander une réservation"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold rounded-xl py-3.5 transition-all shadow-md flex justify-center items-center gap-2"
                  >
                    Connectez-vous pour réserver
                  </button>
                )}
                
                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Aucun montant ne sera débité maintenant.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Facture */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Demande de Réservation Envoyée !</h2>
              <p className="text-gray-500 mt-2">Le propriétaire a bien reçu votre demande.</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Facture Proforma n°{invoiceData.reservationId}</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Locataire :</span> <span>{invoiceData.renterName}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Véhicule :</span> <span>{invoiceData.carName}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Période :</span> <span>Du {new Date(invoiceData.startDate).toLocaleDateString()} au {new Date(invoiceData.endDate).toLocaleDateString()}</span></div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-gray-500"><span>Montant de la location :</span> <span>{invoiceData.amountNet.toLocaleString('fr-CM')} FCFA</span></div>
                  <div className="flex justify-between text-gray-500"><span>Frais de service (5%) :</span> <span>{invoiceData.fee.toLocaleString('fr-CM')} FCFA</span></div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 mt-2 pt-2 border-t border-gray-200">
                    <span>TOTAL TTC :</span> <span className="text-blue-600">{invoiceData.total.toLocaleString('fr-CM')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowInvoice(false);
                navigate('/cars');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Retourner aux véhicules
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
