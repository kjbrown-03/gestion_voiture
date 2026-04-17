import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CarFront, User, Mail, Lock, Phone, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { ApiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "renter" // renter or owner
  });
  const [loading, setLoading] = useState(false);
  const [googleInfo, setGoogleInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await ApiService.register(formData);
      login(res.user);
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          Rejoignez la communauté
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Connectez-vous
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {googleInfo && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {googleInfo}
              </div>
            )}
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <label 
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.role === 'renter' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <input type="radio" name="role" value="renter" className="sr-only" checked={formData.role === 'renter'} onChange={handleChange} />
                <User className={`w-6 h-6 mb-2 ${formData.role === 'renter' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${formData.role === 'renter' ? 'text-blue-800' : 'text-gray-700'}`}>Locataire</span>
              </label>

              <label 
                className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${formData.role === 'owner' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <input type="radio" name="role" value="owner" className="sr-only" checked={formData.role === 'owner'} onChange={handleChange} />
                <CarFront className={`w-6 h-6 mb-2 ${formData.role === 'owner' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-sm font-bold ${formData.role === 'owner' ? 'text-blue-800' : 'text-gray-700'}`}>Propriétaire</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Jean Dupont"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="jean@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Numéro de téléphone</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="+237 6XX XX XX XX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group items-center gap-2"
              >
                {loading ? "Création en cours..." : (
                  <>Créer mon compte <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
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
              onClick={() => setGoogleInfo("L'inscription Google sera active apres ajout de l'endpoint OAuth.")}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <span className="text-lg leading-none">G</span>
              Continuer avec Google
            </button>
            
            <p className="text-xs text-center text-gray-500 flex items-start gap-1.5 mt-4">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
              Vos données sont sécurisées. Vous devrez fournir une pièce d'identité valide avant votre première location au Cameroun.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
