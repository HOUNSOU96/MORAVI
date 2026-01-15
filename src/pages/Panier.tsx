// 📁 src/pages/Checkout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utils/images";
import { motion } from "framer-motion";

/* ---------- Données dynamiques ---------- */
const BENIN_DATA: Record<string, string[]> = {
  Cotonou: ["Ganhi","Zongo","Akpakpa","Fidjrossè","Haie Vive","Cadjèhoun",
           "Agla","Godomey","Gbégamey","Mènontin","Ste Rita","Tokplégbé","Xwlacodji"],
  "Abomey-Calavi": ["Calavi Centre","Godomey","Zogbadjè","Hêvié","Togba","Akassato"],
  "Porto-Novo": ["Avassa","Djègan-Kpèvi","Ouando","Tokpota","Attaké"],
  Parakou: ["Zongo","Banikanni","Albarika","Kpébié"],
  Ouidah: ["Pahou","Avlékété","Savi","Djadjo"],
  Bohicon: ["Saclo","Agongointo","Lissèzoun"],
};

const BENIN_CITIES = Object.keys(BENIN_DATA);

/* ---------- Types ---------- */
type CheckoutForm = {
  nom: string;
  prenom: string;
  pays: string;
  ville: string;
  quartier: string;
  email?: string;
  whatsapp: string;
  livraison: string;
};

type CartItem = {
  id: number;
  slug?: string; // ajout du slug
  name: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  image_url?: string;
  short_description?: string;
};

/* ---------- Component ---------- */
export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    nom: "",
    prenom: "",
    pays: "",
    ville: "",
    quartier: "",
    email: "",
    whatsapp: "",
    livraison: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const saved = localStorage.getItem("moravi_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    setCart(updated);
    localStorage.setItem("moravi_cart", JSON.stringify(updated));
  };

  const handleRemove = (id: number) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem("moravi_cart", JSON.stringify(updated));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "pays") {
      setForm({ ...form, pays: value, ville: "", quartier: "" });
      setErrors({ ...errors, pays: "", ville: "", quartier: "" });
      return;
    }

    if (name === "ville") {
      setForm({ ...form, ville: value, quartier: "" });
      setErrors({ ...errors, ville: "", quartier: "" });
      return;
    }

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!value) setErrors(prev => ({ ...prev, [name]: "Veuillez renseigner ce champ" }));
    else setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    ["nom","prenom","pays","ville","quartier","livraison"].forEach(field => {
      if (!form[field as keyof CheckoutForm]) newErrors[field] = "Veuillez renseigner ce champ";
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    console.log("Commande complète :", { client: form, panier: cart });
    localStorage.removeItem("moravi_cart");
    setSuccess(true);
  };

  if (success)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h2 className="text-3xl mb-4 animate-pulse">Merci pour votre commande !</h2>
        <button
          onClick={() => navigate("/boutique")}
          className="px-6 py-3 bg-red-700 rounded hover:bg-red-800 transition"
        >
          Retour à la boutique
        </button>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-300 bg-gray-900">
        <h2 className="text-2xl mb-4">Votre panier est vide</h2>
        <button
          className="text-red-500 underline hover:text-red-700 transition"
          onClick={() => navigate("/boutique")}
        >
          Retour à la boutique
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-4">
          <div className="flex justify-center items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white animate-fadeIn">
              Finaliser la commande
            </h1>
          </div>
          <div className="flex justify-center items-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white animate-fadeIn">
              Récapitulatif
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          {/* -------- Formulaire -------- */}
          <div className="bg-gray-800/70 p-6 rounded-lg border border-gray-700 shadow-lg space-y-6 animate-fadeIn">
            {["nom","prenom"].map(field => (
              <div key={field} className="space-y-1">
                <label className="block text-gray-200 font-medium capitalize">{field}</label>
                <input
                  name={field}
                  placeholder={`Entrez votre ${field}`}
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form[field as keyof CheckoutForm] || ""}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
              </div>
            ))}

            {/* Pays / Ville / Quartier */}
            <div className="space-y-3">
              <label className="block text-gray-200 font-medium">Pays</label>
              <select
                name="pays"
                value={form.pays}
                required
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                  errors.pays ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>Sélectionnez votre pays</option>
                <option value="Bénin">Bénin</option>
                <option value="Autre">Autre pays</option>
              </select>
              {errors.pays && <p className="text-red-500 text-sm">{errors.pays}</p>}
            </div>

            {form.pays === "Bénin" ? (
              <div className="space-y-3">
                <label className="block text-gray-200 font-medium">Ville</label>
                <select
                  name="ville"
                  value={form.ville}
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                    errors.ville ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>Sélectionnez votre ville</option>
                  {BENIN_CITIES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                {errors.ville && <p className="text-red-500 text-sm">{errors.ville}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-gray-200 font-medium">Ville</label>
                <input
                  name="ville"
                  placeholder="Entrez votre ville"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form.ville}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                    errors.ville ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.ville && <p className="text-red-500 text-sm">{errors.ville}</p>}
              </div>
            )}

            {form.pays === "Bénin" && BENIN_DATA[form.ville] && (
              <div className="space-y-3">
                <label className="block text-gray-200 font-medium">Quartier</label>
                <select
                  name="quartier"
                  value={form.quartier}
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                    errors.quartier ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>Sélectionnez votre quartier</option>
                  {BENIN_DATA[form.ville].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {errors.quartier && <p className="text-red-500 text-sm">{errors.quartier}</p>}
              </div>
            )}

            {/* Email / WhatsApp */}
            {["email","whatsapp"].map(field => (
              <div key={field} className="space-y-1">
                <label className="block text-gray-200 font-medium capitalize">{field}</label>
                <input
                  name={field}
                  placeholder={field === "whatsapp" ? "Numéro WhatsApp (ex : +229XXXXXXXX)" : "Entrez votre email"}
                  required={field==="whatsapp"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={form[field as keyof CheckoutForm] || ""}
                  className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
              </div>
            ))}

            {/* Livraison */}
            <div className="space-y-3">
              <label className="block text-gray-200 font-medium">Mode de réception</label>
              <select
                name="livraison"
                value={form.livraison}
                required
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-red-600 text-black transition ${
                  errors.livraison ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>Choisissez le mode de retrait / livraison</option>
                <option value="livraison">Livraison à domicile</option>
                <option value="retrait">Retrait sur place</option>
              </select>
              {errors.livraison && <p className="text-red-500 text-sm">{errors.livraison}</p>}
            </div>

            <button
              type="submit"
              className="w-full mt-4 px-6 py-3 bg-red-700 rounded hover:bg-red-800 text-white font-semibold transition transform hover:scale-105"
            >
              Valider la commande
            </button>
          </div>

          {/* -------- Panier -------- */}
          <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex flex-col gap-4 shadow-lg animate-fadeIn">
            {cart.map(item => {
              const unitPrice = item.promoPrice || item.price;
              const totalProduit = unitPrice * item.quantity;
              return (
                <motion.div
                  key={item.id}
                  className="flex gap-4 items-center p-2 rounded hover:bg-gray-700 cursor-pointer"
                  whileTap={{ scale: 1.1 }}
                  onClick={() => navigate(`/produit/${item.slug || item.id}`)} // <-- accès par slug si disponible
                >
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded transition"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    {item.short_description && (
                      <p className="text-gray-400 text-sm">{item.short_description}</p>
                    )}
                    <p className="text-green-400 mt-1">Prix unitaire : {unitPrice} FCFA</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}
                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                      >
                        −
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}
                        className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-yellow-400 mt-2 font-semibold">Total produit : {totalProduit} FCFA</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                    className="px-3 py-1 bg-red-600 rounded-md text-white hover:bg-red-700 text-sm transition"
                  >
                    Supprimer
                  </button>
                </motion.div>
              );
            })}

            <div className="mt-2 border-t border-gray-700 pt-2 flex justify-between font-semibold text-lg">
              <span>Total général :</span>
              <span>
                {cart.reduce((sum, i) => sum + (i.promoPrice || i.price) * i.quantity, 0)} FCFA
              </span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
