import { Car, User, Reservation, Contract, Review } from "../types";

const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const ApiService = {
  getCars: async (filters?: any): Promise<Car[]> => {
    const response = await fetch(`${API_URL}/cars`);
    if (!response.ok) throw new Error("Erreur réseau");
    return response.json();
  },

  getCarById: async (id: string): Promise<Car | undefined> => {
    const response = await fetch(`${API_URL}/cars/${id}`);
    if (!response.ok) throw new Error("Véhicule introuvable");
    return response.json();
  },

  createCar: async (carData: Partial<Car>): Promise<Car> => {
    const response = await fetch(`${API_URL}/cars`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(carData)
    });
    if (!response.ok) throw new Error("Impossible de créer la voiture");
    return response.json();
  },

  register: async (data: any): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur d'enregistrement");
    }
    const result = await response.json();
    return result;
  },

  login: async (credentials: any): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Identifiants invalides");
    }
    
    const result = await response.json();
    if(result.token) localStorage.setItem("token", result.token);
    return result;
  },

  updatePassword: async (email: string, newPassword: string) => {
    // Dans le monde réel on ferait un appel /auth/reset-password
    // Ici on suppose que le endpoint existe ou on va simuler si absent
    alert("Simulation: " + newPassword);
  },

  getReservations: async (): Promise<Reservation[]> => {
    const response = await fetch(`${API_URL}/reservations/mon-historique`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Erreur");
    const raw = await response.json();
    return raw.map((r: any) => ({
      ...r,
      carId: r.car_id,
      renterId: r.renter_id,
      startDate: r.start_date,
      endDate: r.end_date,
      totalPrice: r.total_price
    }));
  },

  createReservation: async (data: any): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        car_id: data.carId,
        start_date: data.startDate,
        end_date: data.endDate,
        total_price: data.totalPrice
      })
    });
    if (!response.ok) throw new Error("Échec de la réservation");
    const result = await response.json();
    return { ...data, id: result.reservationId };
  },

  updateReservationStatus: async (id: string, status: string): Promise<Reservation> => {
    const response = await fetch(`${API_URL}/reservations/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error("Erreur de mise à jour");
    return response.json();
  }
};
