import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CarFront, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { ApiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // API Call simulation
      const res = await ApiService.login({ email, password });
      login(res.user);
      navigate("/");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link to="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 bg-white/80 border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all font-semibold shadow-sm z-10 backdrop-blur-sm">
        <ArrowLeft className="w-5 h-5" />
        Retour à l'accueil
      </Link>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
            <CarFront className="w-8 h-8" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">LocAuto<span className="text-blue-600">CM</span></span>
        </Link>
        <h2 className="mt-8 text-center text-2xl font-bold text-gray-900">
          Connectez-vous à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            créez un nouveau compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Adresse email
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group items-center gap-2"
              >
                {loading ? "Connexion en cours..." : (
                  <>Se connecter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setError("La connexion Google sera active apres ajout de l'endpoint OAuth.")}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <span className="text-lg leading-none">G</span>
              Continuer avec Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
