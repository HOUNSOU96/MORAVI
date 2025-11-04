import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getImageUrl } from "@/utils/images";

type Product = {
  id: number;
  name: string;
  slug?: string;
  price: number;
  promoPrice?: number;
  image_url?: string;
  short_description?: string;
  description?: string;
  category?: string;
};

const Produit: React.FC = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { from?: any };
  const from = state?.from ? state.from : "/";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Motion values pour effet parallax et ombre dynamique
  const mouseX = useMotionValue(window.innerWidth / 2);
  const mouseY = useMotionValue(window.innerHeight / 2);

  // Calculs de déplacement et d’ombre
  const translateX = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
  const translateY = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);
  const shadowX = useTransform(mouseX, [0, window.innerWidth], [-10, 10]);
  const shadowY = useTransform(mouseY, [0, window.innerHeight], [-10, 10]);

  // Ombre dynamique (fixe les erreurs de typage)
  const boxShadow = useTransform([shadowX, shadowY], (values) => {
    const [x, y] = values as number[];
    return `${x}px ${y}px 40px rgba(0,0,0,0.4)`;
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };
  const handleMouseLeave = () => {
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
  };

  useEffect(() => {
    let mounted = true;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/products/slug/${slug}`);
        if (!mounted) return;
        const data = res.data.product || res.data;
        setProduct(data);
        console.log("🧠 Produit reçu :", data);
      } catch (err) {
        if (!mounted) return;
        setError("Impossible de charger le produit.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProduct();
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) return <div className="text-center py-12 text-gray-400">Chargement…</div>;
  if (error) return <div className="text-center py-12 text-red-400">{error}</div>;
  if (!product) return <div className="text-center py-12 text-gray-400">Produit introuvable.</div>;

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate(from)}
        className="mb-6 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition"
      >
        ← Retour
      </button>

      <div className="md:flex gap-8">
        {/* Image avec effet dynamique */}
        <motion.div
          className="md:w-1/2 rounded-lg overflow-hidden shadow-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 800 }}
        >
          <motion.img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-auto rounded-lg object-cover"
            style={{
              x: translateX,
              y: translateY,
              boxShadow,
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            loading="lazy"
          />
        </motion.div>

        {/* Infos produit */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {product.short_description && (
            <p className="text-gray-400 mt-2">{product.short_description}</p>
          )}

          <div className="mt-4 text-2xl font-bold flex items-center gap-3">
            {product.promoPrice ? (
              <>
                <span className="text-green-400">{formatPrice(product.promoPrice)}</span>
                <span className="line-through text-red-500 text-lg">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
          </div>

          {product.category && (
            <p className="mt-2 text-sm text-gray-400">
              Catégorie : <span className="text-gray-200">{product.category}</span>
            </p>
          )}

          {product.description && (
            <p className="mt-6 text-gray-300 leading-relaxed">{product.description}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,0,0,0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-3 bg-red-700 text-white rounded hover:bg-red-600 transition w-max"
          >
            Ajouter au panier
          </motion.button>
        </div>
      </div>
    </div>
  );
};

function formatPrice(p?: number) {
  return p == null ? "—" : Number(p).toFixed(2) + " €";
}

export default Produit;
