import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Car, Reservation } from "../types";
import { Users, CarFront, FileText, Settings, Activity, Search, ShieldAlert, BadgeCheck } from "lucide-react";
import { Link } from "react-router";

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, cars: 0, activeReservations: 0, revenue: 0 });

  useEffect(() => {
    // Mock fetch
    setStats({
      users: 145,
      cars: 82,
      activeReservations: 24,
      revenue: 1540000
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administration LocAutoCM</h1>
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4" /> Admin
          </span>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Utilisateurs</h3>
            <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
          <p className="text-sm text-green-600 font-medium mt-2">+12 ce mois</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Véhicules</h3>
            <div className="bg-orange-50 p-2 rounded-lg"><CarFront className="w-5 h-5 text-orange-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.cars}</p>
          <p className="text-sm text-green-600 font-medium mt-2">+5 cette semaine</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Réservations Actives</h3>
            <div className="bg-purple-50 p-2 rounded-lg"><Activity className="w-5 h-5 text-purple-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeReservations}</p>
          <p className="text-sm text-gray-500 font-medium mt-2">En cours</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Commissions (Est.)</h3>
            <div className="bg-green-50 p-2 rounded-lg"><FileText className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.revenue.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span></p>
          <p className="text-sm text-green-600 font-medium mt-2">+15% vs mois dernier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Dernières Activités</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Voir tout</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {i % 2 === 0 ? <CarFront className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {i % 2 === 0 ? "Nouveau véhicule ajouté (Toyota RAV4)" : "Nouvel utilisateur inscrit (Paul M.)"}
                  </p>
                  <p className="text-xs text-gray-500">Il y a {i * 2} heures</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Search className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" /> À vérifier
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">KYC en attente</span>
                  <span className="text-xs text-gray-500">12 utilisateurs</span>
                </div>
                <button className="text-xs bg-red-50 text-red-700 px-2.5 py-1.5 rounded font-medium hover:bg-red-100">
                  Examiner
                </button>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Litiges ouverts</span>
                  <span className="text-xs text-gray-500">2 signalements</span>
                </div>
                <button className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded font-medium hover:bg-orange-100">
                  Gérer
                </button>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Actions Rapides</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex flex-col items-center gap-2 text-center">
                <Users className="w-5 h-5" />
                Gérer Utilisateurs
              </button>
              <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex flex-col items-center gap-2 text-center">
                <CarFront className="w-5 h-5" />
                Flotte
              </button>
              <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex flex-col items-center gap-2 text-center">
                <FileText className="w-5 h-5" />
                Contrats
              </button>
              <button className="bg-white border border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex flex-col items-center gap-2 text-center">
                <Settings className="w-5 h-5" />
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}