import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CarFront, Mail, Lock, ArrowLeft, KeyRound } from "lucide-react";
import { ApiService } from "../services/api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await ApiService.sendResetCode(email);
      setMessage(result.message);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await ApiService.verifyResetCode(email, code);
      setResetToken(result.resetToken);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await ApiService.changeForgottenPassword(resetToken, newPassword);
      setMessage("Mot de passe change avec succes. Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link to="/login" className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 bg-white/80 border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition-all font-semibold shadow-sm z-10 backdrop-blur-sm">
        <ArrowLeft className="w-5 h-5" />
        Retour a la connexion
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
            <CarFront className="w-8 h-8" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">LocAuto<span className="text-blue-600">CM</span></span>
        </Link>
        <h2 className="mt-8 text-center text-2xl font-bold text-gray-900">
          {step === 1 && "Mot de passe oublie"}
          {step === 2 && "Verification du code"}
          {step === 3 && "Choisissez un nouveau mot de passe"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-4">
          {step === 1 && "Entrez votre email. Un code sera envoye sur Gmail si la configuration email est active."}
          {step === 2 && "Entrez le code recu dans votre boite mail."}
          {step === 3 && "Le code est valide. Vous pouvez maintenant definir votre nouveau mot de passe."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium border border-green-100">
              {message}
            </div>
          )}

          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Adresse email</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70">
                {loading ? "Envoi..." : "Envoyer le code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Code de verification</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Entrez le code reçu"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70">
                {loading ? "Verification..." : "Verifier le code"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Confirmer le mot de passe</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="block w-full pl-10 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70">
                {loading ? "Modification..." : "Changer le mot de passe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
