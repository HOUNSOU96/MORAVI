import React, { useEffect, useState } from "react";
import { getImageUrl } from "@/utils/images";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";

type CartItem = {
  id: number;
  name: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  image_url?: string;
  short_description?: string;
};

type Order = {
  id: number;
  user_name: string;
  whatsapp: string;
  secondary_phone?: string;
  email?: string;
  address?: string;
  city: string;
  zip?: string;
  items: CartItem[];
  total: number;
  created_at: string;
  status: "pending" | "delivered";
};

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterWhatsApp, setFilterWhatsApp] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders/all");
        setOrders(res.data);
        setFilteredOrders(res.data);
      } catch (err: any) {
        setError("Impossible de récupérer les commandes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtrage + tri
  useEffect(() => {
    let result = [...orders];
    if (filterName) result = result.filter(o => o.user_name.toLowerCase().includes(filterName.toLowerCase()));
    if (filterCity) result = result.filter(o => o.city.toLowerCase().includes(filterCity.toLowerCase()));
    if (filterWhatsApp) result = result.filter(o => o.whatsapp.includes(filterWhatsApp));
    result.sort((a, b) =>
      sortAsc
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setFilteredOrders(result);
  }, [filterName, filterCity, filterWhatsApp, sortAsc, orders]);

  const deleteOrder = async (id: number) => {
    try {
      await api.delete(`/api/orders/${id}`);
      setOrders(orders.filter(o => o.id !== id));
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la commande");
    }
  };

  const markDelivered = async (order: Order) => {
    try {
      await api.patch(`/api/orders/${order.id}`, { status: "delivered" });
      const updated: Order[] = orders.map(o =>
        o.id === order.id ? { ...o, status: "delivered" } : o
      );

      setOrders(updated);
      setSelectedOrder({ ...order, status: "delivered" });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la commande");
    }
  };

  // 🔥 BOUTON DECONNEXION
  const handleLogout = () => {
  localStorage.clear(); // nettoie tout
  navigate("/login", { replace: true });
};


  if (loading) return <p className="text-center mt-10 text-gray-300">Chargement...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Toutes les commandes</h1>

        {/* 🔥 BOUTON DECONNEXION */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Déconnexion
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Filtrer par nom"
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Filtrer par ville"
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Filtrer par WhatsApp"
          value={filterWhatsApp}
          onChange={e => setFilterWhatsApp(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Trier par date {sortAsc ? "(asc)" : "(desc)"}
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-400">Aucune commande trouvée.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer hover:bg-gray-700"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Commande #{order.id}</h2>
                <span className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <p><strong>Nom :</strong> {order.user_name}</p>
              <p><strong>WhatsApp :</strong> {order.whatsapp}</p>
              <p><strong>Ville :</strong> {order.city}</p>
              <p><strong>Status :</strong> {order.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-3xl relative">
            <button
              className="absolute top-3 right-3 text-red-500 font-bold text-xl"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">Commande #{selectedOrder.id}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Nom :</strong> {selectedOrder.user_name}</p>
                <p><strong>WhatsApp :</strong> {selectedOrder.whatsapp}</p>
                {selectedOrder.secondary_phone && <p><strong>Tel secondaire :</strong> {selectedOrder.secondary_phone}</p>}
                {selectedOrder.email && <p><strong>Email :</strong> {selectedOrder.email}</p>}
                {selectedOrder.address && <p><strong>Adresse :</strong> {selectedOrder.address}</p>}
                <p><strong>Ville :</strong> {selectedOrder.city}</p>
                {selectedOrder.zip && <p><strong>Code postal :</strong> {selectedOrder.zip}</p>}
                <p><strong>Total :</strong> {selectedOrder.total.toFixed(2)} FCFA</p>
                <p><strong>Status :</strong> {selectedOrder.status}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Produits :</h3>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center bg-gray-800 p-2 rounded">
                    <img src={getImageUrl(item.image_url)} alt={item.name} className="w-16 h-16 object-cover rounded"/>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.short_description && <p className="text-gray-400 text-sm">{item.short_description}</p>}
                      <p className="text-gray-300 text-sm">
                        {item.promoPrice ? (
                          <>
                            <span className="line-through text-red-400">{item.price.toFixed(2)} FCFA</span>{" "}
                            <span className="text-green-500">{item.promoPrice.toFixed(2)} FCFA</span>
                          </>
                        ) : `${item.price.toFixed(2)} €`} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                onClick={() => deleteOrder(selectedOrder.id)}
              >
                Supprimer
              </button>
              {selectedOrder.status !== "delivered" && (
                <button
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                  onClick={() => markDelivered(selectedOrder)}
                >
                  Marquer comme livrée
                </button>
              )}
              <button
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                onClick={() => setSelectedOrder(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
