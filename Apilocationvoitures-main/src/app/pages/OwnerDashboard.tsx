import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Car, Reservation } from "../types";
import { PlusCircle, Key, Calendar, MapPin, Users, Activity, X } from "lucide-react";
import { Link } from "react-router";
import { ApiService } from "../services/api";

export function OwnerDashboard() {
  const { user } = useAuth();
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    make: "", model: "", year: 2024, pricePerDay: 25000, location: "Douala", category: "SUV", seats: 5, transmission: "Automatique"
  });

  useEffect(() => {
    const fetchData = async () => {
      const allCars = await ApiService.getCars();
      // Filtrer les voitures appartenant à l'utilisateur connecté (ou o1 par défaut)
      const ownerCars = allCars.filter(c => c.ownerId === (user?.id || 'o1'));
      setMyCars(ownerCars);

      const allRes = await ApiService.getReservations();
      // Garder les réservations pour les voitures de ce propriétaire
      const ownerCarIds = ownerCars.map(c => c.id);
      const ownerRes = allRes.filter(r => ownerCarIds.includes(r.carId));
      setRequests(ownerRes);
    };
    fetchData();
  }, [user]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await ApiService.createCar({
        ...newCar,
        ownerId: user?.id,
        available: true,
        images: ["https://images.unsplash.com/photo-1659947234309-804b7fa01cf2"] 
      });
      setMyCars([added, ...myCars]);
      setIsAddingCar(false);
      alert("Véhicule ajouté avec succès !");
    } catch (err) {
      alert("Erreur lors de l'ajout.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Espace Propriétaire</h1>
        <button onClick={() => setIsAddingCar(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 w-max">
          <PlusCircle className="w-5 h-5" />
          Ajouter un véhicule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Mes véhicules</p>
            <p className="text-2xl font-bold text-gray-900">{myCars.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-xl">
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Demandes en attente</p>
            <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Revenus estimés</p>
            <p className="text-2xl font-bold text-gray-900">225 000 FCFA</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Demandes de réservation</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500 italic">Aucune demande pour le moment.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          <ul className="divide-y divide-gray-100">
            {requests.map((req) => (
              <li key={req.id} className="p-6 flex flex-col md:flex-row gap-6 items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-gray-900">Demande pour Vehicule #{req.carId}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      En attente
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Du {new Date(req.startDate).toLocaleDateString()} au {new Date(req.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500 mb-1">Montant total</p>
                  <p className="text-xl font-bold text-blue-600">{req.totalPrice.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {req.status === 'pending' ? (
                    <>
                      <button 
                        onClick={async () => {
                          await ApiService.updateReservationStatus(req.id, 'accepted');
                          setRequests(requests.map(r => r.id === req.id ? {...r, status: 'accepted'} : r));
                          alert("Réservation acceptée ! La voiture est maintenant marquée comme louée.");
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                      >
                        Accepter
                      </button>
                      <button 
                        onClick={async () => {
                          await ApiService.updateReservationStatus(req.id, 'rejected');
                          setRequests(requests.map(r => r.id === req.id ? {...r, status: 'rejected'} : r));
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                      >
                        Refuser
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-lg font-medium text-sm ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {req.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-6">Mes véhicules en location</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCars.map((car) => (
          <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{car.make} {car.model}</h3>
              <p className="text-sm text-gray-500 mb-4">{car.year} • {car.category}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-lg font-bold text-blue-600">{car.pricePerDay.toLocaleString('fr-FR')} FCFA<span className="text-sm text-gray-500 font-normal">/j</span></span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {car.available ? "Disponible" : "Loué"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex gap-2">
              <Link to={`/cars/${car.id}`} className="flex-1 text-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Voir
              </Link>
              <button className="flex-1 text-center bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de véhicule */}
      {isAddingCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un véhicule</h2>
              <button onClick={() => setIsAddingCar(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCar} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marque</label>
                  <input required type="text" value={newCar.make} onChange={e => setNewCar({...newCar, make: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Toyota" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modèle</label>
                  <input required type="text" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Corolla" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Année</label>
                  <input required type="number" value={newCar.year} onChange={e => setNewCar({...newCar, year: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prix par jour (FCFA)</label>
                  <input required type="number" value={newCar.pricePerDay} onChange={e => setNewCar({...newCar, pricePerDay: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                  <select value={newCar.category} onChange={e => setNewCar({...newCar, category: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="SUV">SUV</option>
                    <option value="Berline">Berline</option>
                    <option value="Citadine">Citadine</option>
                    <option value="4x4">4x4</option>
                    <option value="Utilitaire">Utilitaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                  <select value={newCar.location} onChange={e => setNewCar({...newCar, location: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Kribi">Kribi</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddingCar(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Annuler</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-colors">Enregistrer le véhicule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}