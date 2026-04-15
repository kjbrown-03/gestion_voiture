import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { CarFront, Menu, LogIn, X, LogOut, LayoutDashboard, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";
import { ApiService } from "../services/api";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (location.hash === "#how-it-works") {
      setTimeout(() => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setNotifications([]);
      return;
    }

    ApiService.getProfile()
      .then(setProfile)
      .catch(() => setProfile(user));

    ApiService.getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [user]);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Trouver une voiture", path: "/cars" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === 'admin') return "/dashboard/admin";
    if (user.role === 'owner') return "/dashboard/owner";
    return "/dashboard/renter";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <CarFront className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LocAuto<span className="text-blue-600">CM</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={clsx(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    location.pathname === link.path ? "text-blue-600" : "text-gray-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="/#how-it-works"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  } else {
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Comment ça marche
              </a>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen((value) => !value)}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50"
                  >
                    <Bell className="w-5 h-5 text-gray-700" />
                    {notifications.filter((item) => !item.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {notifications.filter((item) => !item.isRead).length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-2.5 mr-2 px-3 py-1.5 bg-blue-50/50 rounded-full border border-blue-100 hover:bg-blue-50"
                  >
                    <div className="w-7 h-7 flex-shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 hidden lg:block max-w-[120px] truncate">{user.name}</span>
                  </button>
                  <Link to={getDashboardPath()} className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors mr-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Tableau de bord</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 text-red-600 hover:text-red-700 font-medium text-sm transition-colors border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {user && isNotificationsOpen && (
          <div className="absolute right-4 top-20 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white shadow-2xl p-4 z-[70]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              <button type="button" onClick={() => setIsNotificationsOpen(false)} className="text-sm text-gray-500 hover:text-gray-900">
                Fermer
              </button>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Aucune notification pour le moment.
                </div>
              ) : notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={async () => {
                    if (!notification.isRead) {
                      await ApiService.markNotificationRead(notification.id);
                      const updated = await ApiService.getNotifications();
                      setNotifications(updated);
                    }
                  }}
                  className={`w-full text-left rounded-xl border p-4 ${notification.isRead ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"}`}
                >
                  <p className="font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="/#how-it-works"
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  } else {
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Comment ça marche
              </a>
              <div className="pt-4 flex flex-col gap-3 px-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 mb-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-left"
                    >
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </button>
                    <Link
                      to={getDashboardPath()}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg text-blue-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Tableau de bord</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 border border-red-200 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 px-4 py-2.5 rounded-lg text-gray-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Se connecter</span>
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {isProfileOpen && profile && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Mon profil</h2>
              <button type="button" onClick={() => setIsProfileOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                  {(profile.name || user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{profile.name || user?.name}</p>
                  <p className="text-sm text-gray-500">{profile.role === "owner" ? "Proprietaire" : profile.role === "admin" ? "Administrateur" : "Locataire"}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 text-right">{profile.email}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Telephone</span>
                  <span className="font-medium text-gray-900 text-right">{profile.phone || "Non renseigne"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Identifiant</span>
                  <span className="font-medium text-gray-900 text-right">#{profile.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-1.5 rounded-md text-white">
                  <CarFront className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">LocAuto<span className="text-blue-500">CM</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La plateforme de référence pour la location de véhicules entre particuliers au Cameroun. Simple, sécurisé et rapide.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Villes</h3>
              <ul className="space-y-3">
                <li><Link to="/cars?location=Douala" className="text-gray-400 hover:text-white transition-colors text-sm">Location à Douala</Link></li>
                <li><Link to="/cars?location=Yaoundé" className="text-gray-400 hover:text-white transition-colors text-sm">Location à Yaoundé</Link></li>
                <li><Link to="/cars?location=Kribi" className="text-gray-400 hover:text-white transition-colors text-sm">Location à Kribi</Link></li>
                <li><Link to="/cars?location=Bafoussam" className="text-gray-400 hover:text-white transition-colors text-sm">Location à Bafoussam</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Utiles</h3>
              <ul className="space-y-3">
                <li><Link to="/#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">Comment ça marche</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">Devenir propriétaire</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Espace locataire</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">Assurance & Contrats</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Support: +237 6XX XX XX XX</li>
                <li>Email: contact@locautocm.com</li>
                <li>Adresse: Akwa, Douala, Cameroun</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} LocAutoCM. Tous droits réservés. Projet API REST.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
