import { useEffect, useState } from "react";
import { BadgeCheck, CarFront, FileText, Users } from "lucide-react";
import { ApiService } from "../services/api";

export function AdminDashboard() {
  const [overview, setOverview] = useState<any>({
    stats: { users: 0, cars: 0, activeReservations: 0, revenue: 0 },
    users: [],
    cars: [],
    reservations: []
  });

  useEffect(() => {
    ApiService.getAdminOverview().then(setOverview).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration LocAutoCM</h1>
          <p className="text-sm text-gray-500 mt-2">Compte admin: admin@gmail.com / admin</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <BadgeCheck className="w-4 h-4" /> Admin
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Utilisateurs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Vehicules</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.cars}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Reservations actives</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{overview.stats.activeReservations}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Facturation</h3>
          <p className="text-3xl font-bold text-gray-900 mt-3">{Number(overview.stats.revenue).toLocaleString("fr-FR")} FCFA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Utilisateurs</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {overview.users.map((user: any) => (
              <div key={user.id} className="p-4">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-blue-600 mt-1">{user.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <CarFront className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Voitures</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {overview.cars.map((car: any) => (
              <div key={car.id} className="p-4">
                <p className="font-semibold text-gray-900">{car.make} {car.model}</p>
                <p className="text-sm text-gray-600">{car.owner_name} • {car.location}</p>
                <p className={`text-sm mt-1 ${car.available ? "text-green-600" : "text-red-600"}`}>
                  {car.available ? "Disponible" : "Indisponible"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Reservations et locations</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {overview.reservations.map((reservation: any) => (
            <div key={reservation.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{reservation.car_name}</p>
                <p className="text-sm text-gray-600">{reservation.renter_name} {"->"} {reservation.owner_name}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-700">{reservation.type}</p>
                <p className="text-sm text-blue-600">{Number(reservation.total_price).toLocaleString("fr-FR")} FCFA</p>
                <p className="text-sm text-gray-500">{reservation.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
