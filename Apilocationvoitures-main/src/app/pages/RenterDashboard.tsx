import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Car, Reservation } from "../types";
import { Calendar, CarFront, CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Link } from "react-router";
import { ApiService } from "../services/api";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { DashboardNotifications } from "../components/DashboardNotifications";

export function RenterDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [reservationData, carData] = await Promise.all([
        ApiService.getReservations(),
        ApiService.getCars()
      ]);
      setReservations(reservationData);
      setCars(carData.filter((car) => car.available).slice(0, 6));
    };
    fetchData();
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending": return <Clock className="w-5 h-5 text-orange-500" />;
      case "rejected":
      case "cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted": return "Acceptee";
      case "pending": return "En attente";
      case "rejected": return "Refusee";
      case "cancelled": return "Annulee";
      case "completed": return "Terminee";
      default: return status;
    }
  };

  const buildInvoiceHtml = (reservation: Reservation) => {
    const amountNet = reservation.totalPrice / 1.05;
    const serviceFee = reservation.totalPrice - amountNet;
    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Facture ${reservation.invoiceNumber || ""}</title>
          <style>
            body { font-family: Arial, sans-serif; background:#f5f7fb; color:#1f2937; padding:24px; }
            .card { max-width:720px; margin:0 auto; background:#fff; border:1px solid #dbe3f0; border-radius:18px; padding:32px; }
            .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:24px; }
            .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:12px; font-weight:700; }
            .row { display:flex; justify-content:space-between; gap:16px; padding:10px 0; border-bottom:1px solid #eef2f7; }
            .total { font-size:20px; font-weight:700; color:#1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="head">
              <div>
                <h1 style="margin:0 0 8px;">Facture</h1>
                <div class="badge">${reservation.type === "rental" ? "Location" : "Reservation"}</div>
              </div>
              <div style="text-align:right;">
                <div><strong>${reservation.invoiceNumber || ""}</strong></div>
                <div>${reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
            <div class="row"><span>Locataire</span><strong>${user?.name || ""}</strong></div>
            <div class="row"><span>Proprietaire</span><strong>${reservation.ownerName || ""}</strong></div>
            <div class="row"><span>Vehicule</span><strong>${reservation.carName || ""}</strong></div>
            <div class="row"><span>Periode</span><strong>Du ${new Date(reservation.startDate).toLocaleDateString("fr-FR")} au ${new Date(reservation.endDate).toLocaleDateString("fr-FR")}</strong></div>
            <div class="row"><span>Montant location</span><strong>${amountNet.toLocaleString("fr-FR")} FCFA</strong></div>
            <div class="row"><span>Frais service</span><strong>${serviceFee.toLocaleString("fr-FR")} FCFA</strong></div>
            <div class="row" style="border-bottom:none; padding-top:18px;">
              <span class="total">Total</span>
              <span class="total">${reservation.totalPrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const downloadInvoice = (reservation: Reservation) => {
    const blob = new Blob([buildInvoiceHtml(reservation)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reservation.invoiceNumber || "facture"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Mes demandes</p>
          <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-gray-900">{reservations.filter((r) => r.status === "pending").length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Acceptees</p>
          <p className="text-2xl font-bold text-gray-900">{reservations.filter((r) => r.status === "accepted").length}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Louer ou reserver une voiture</h1>
          <Link to="/cars" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Voir toutes les voitures
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col">
              <ImageWithFallback src={car.images[0]} alt={`${car.make} ${car.model}`} className="h-48 w-full object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900">{car.make} {car.model}</h3>
                <p className="text-sm text-gray-500 mt-1">{car.location} • {car.category}</p>
                <p className="text-sm text-gray-600 mt-2">Proprietaire: {car.ownerName}</p>
                <p className="text-lg font-bold text-blue-600 mt-4">{car.pricePerDay.toLocaleString("fr-FR")} FCFA/jour</p>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <Link to={`/cars/${car.id}`} className="text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Louer
                  </Link>
                  <Link to={`/cars/${car.id}`} className="text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Reserver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes reservations et locations</h2>
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CarFront className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune operation</h3>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore loue ou reserve de vehicule.</p>
            <Link to="/cars" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Trouver une voiture
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((res) => (
              <div key={res.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <CarFront className="w-8 h-8 text-blue-600" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-lg text-gray-900">{res.carName}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200">
                      {res.type === "rental" ? "Location" : "Reservation"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-white text-gray-700 border-gray-200">
                      {getStatusIcon(res.status)}
                      {getStatusText(res.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Du {new Date(res.startDate).toLocaleDateString()} au {new Date(res.endDate).toLocaleDateString()}
                    </div>
                    <div>Proprietaire: {res.ownerName}</div>
                    {res.invoiceNumber ? <div>Facture: {res.invoiceNumber}</div> : <div>Facture envoyee apres acceptation</div>}
                  </div>
                </div>

                <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Montant total</p>
                  <p className="text-2xl font-bold text-blue-600">{res.totalPrice.toLocaleString("fr-FR")} FCFA</p>
                  <div className="flex flex-wrap gap-2 mt-3 md:justify-end">
                    <Link to={`/cars/${res.carId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-block">
                      Voir le vehicule
                    </Link>
                    {res.status === "accepted" && res.invoiceNumber && (
                      <>
                        <button type="button" onClick={() => setSelectedReservation(res)} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                          <FileText className="w-4 h-4" />
                          Voir la facture
                        </button>
                        <button type="button" onClick={() => downloadInvoice(res)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                          Telecharger
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DashboardNotifications />

      {selectedReservation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Facture</h2>
              <button type="button" onClick={() => setSelectedReservation(null)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between"><span>Numero</span><strong>{selectedReservation.invoiceNumber}</strong></div>
              <div className="flex justify-between"><span>Type</span><strong>{selectedReservation.type === "rental" ? "Location" : "Reservation"}</strong></div>
              <div className="flex justify-between"><span>Locataire</span><strong>{user?.name}</strong></div>
              <div className="flex justify-between"><span>Proprietaire</span><strong>{selectedReservation.ownerName}</strong></div>
              <div className="flex justify-between"><span>Vehicule</span><strong>{selectedReservation.carName}</strong></div>
              <div className="flex justify-between"><span>Periode</span><strong>Du {new Date(selectedReservation.startDate).toLocaleDateString()} au {new Date(selectedReservation.endDate).toLocaleDateString()}</strong></div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg"><span>Total</span><strong className="text-blue-600">{selectedReservation.totalPrice.toLocaleString("fr-FR")} FCFA</strong></div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedReservation(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Fermer
              </button>
              <button type="button" onClick={() => downloadInvoice(selectedReservation)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Telecharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
