import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "@/utils/axios";

const Login: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Veuillez saisir un mot de passe.");
      return;
    }

    try {
      const res = await api.post("/api/admin/check-admin", { password });

      if (res.data.access) {
        // Stocker un token fictif pour l'exemple
         localStorage.setItem("token", res.data.token);

        // Redirection vers AdminOrders
        navigate("/admin/orders");
      } else {
        setError(res.data.message || "Mot de passe incorrect.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la connexion.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-extrabold text-center text-blue-700 dark:text-white tracking-tight">
            Connexion
          </h2>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Se connecter
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
