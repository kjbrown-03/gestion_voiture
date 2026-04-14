import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Reservation } from "../types";
import { Calendar, CarFront, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "react-router";

export function RenterDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    // Mocking reservations fetch
    setReservations([
      {
        id: "r1",
        carId: "1",
        renterId: user?.id || "u1",
        startDate: "2024-05-12",
        endDate: "2024-05-15",
        totalPrice: 135000,
        status: "accepted"
      },
      {
        id: "r2",
        carId: "2",
        renterId: user?.id || "u1",
        startDate: "2024-06-01",
        endDate: "2024-06-05",
        totalPrice: 100000,
        status: "pending"
      }
    ]);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'rejected': case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'accepted': return "Acceptée";
      case 'pending': return "En attente";
      case 'rejected': return "Refusée";
      case 'cancelled': return "Annulée";
      case 'completed': return "Terminée";
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes Réservations</h1>
      
      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CarFront className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
          <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de réservation de véhicule.</p>
          <Link to="/cars" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Trouver un véhicule
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
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-gray-900">Réservation #{res.id.toUpperCase()}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border
                    ${res.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                      res.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      'bg-red-50 text-red-700 border-red-200'}
                  `}>
                    {getStatusIcon(res.status)}
                    {getStatusText(res.status)}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Du {new Date(res.startDate).toLocaleDateString()} au {new Date(res.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Montant total</p>
                <p className="text-2xl font-bold text-blue-600">{res.totalPrice.toLocaleString('fr-FR')} FCFA</p>
                <Link to={`/cars/${res.carId}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block">
                  Voir le véhicule
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}