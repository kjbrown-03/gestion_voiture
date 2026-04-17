import { Car, Invoice, NotificationItem, Reservation, Review, User } from "../types";

const API_URL = "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const parseJson = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Une erreur est survenue.");
  }
  return data;
};

export const ApiService = {
  getCars: async (): Promise<Car[]> => {
    const response = await fetch(`${API_URL}/cars`);
    return parseJson(response);
  },

  getCarById: async (id: string): Promise<Car> => {
    const response = await fetch(`${API_URL}/cars/${id}`);
    return parseJson(response);
  },

  createCar: async (carData: Partial<Car>): Promise<Car> => {
    const response = await fetch(`${API_URL}/cars`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(carData)
    });
    return parseJson(response);
  },

  register: async (data: any): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await parseJson(response);
    if (result.token) {
      localStorage.setItem("token", result.token);
    }
    return result;
  },

  login: async (credentials: any): Promise<{ token: string; user: User }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const result = await parseJson(response);
    if (result.token) {
      localStorage.setItem("token", result.token);
    }
    return result;
  },

  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  sendResetCode: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return parseJson(response);
  },

  verifyResetCode: async (email: string, code: string): Promise<{ resetToken: string }> => {
    const response = await fetch(`${API_URL}/auth/forgot-password/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    return parseJson(response);
  },

  changeForgottenPassword: async (resetToken: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken, newPassword })
    });
    return parseJson(response);
  },

  getReservations: async (): Promise<Reservation[]> => {
    const response = await fetch(`${API_URL}/reservations/mon-historique`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  createReservation: async (data: {
    carId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    type: "rental" | "reservation";
  }): Promise<{ reservation: Reservation; invoice?: Invoice }> => {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        car_id: data.carId,
        start_date: data.startDate,
        end_date: data.endDate,
        total_price: data.totalPrice,
        type: data.type
      })
    });
    return parseJson(response);
  },

  updateReservationStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/reservations/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return parseJson(response);
  },

  updateCarImages: async (id: string, images: string[]) => {
    const response = await fetch(`${API_URL}/cars/${id}/images`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ images })
    });
    return parseJson(response);
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await fetch(`${API_URL}/invoices`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  markNotificationRead: async (id: string) => {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: getHeaders()
    });
    return parseJson(response);
  },

  getAdminOverview: async () => {
    const response = await fetch(`${API_URL}/admin/overview`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  submitReview: async (data: {
    reservation_id: number;
    rating: number;
    comment?: string;
  }): Promise<{ message: string; rating: number; comment?: string }> => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseJson(response);
  },

  getCarReviews: async (carId: string): Promise<Review[]> => {
    const response = await fetch(`${API_URL}/cars/${carId}/reviews`);
    return parseJson(response);
  },

  getMyReviews: async (): Promise<Review[]> => {
    const response = await fetch(`${API_URL}/reviews/my-reviews`, {
      headers: getHeaders()
    });
    return parseJson(response);
  },

  getCarComments: async (carId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/cars/${carId}/comments`);
    return parseJson(response);
  },

  submitCarComment: async (carId: string, comment: string): Promise<any> => {
    const response = await fetch(`${API_URL}/cars/${carId}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ comment })
    });
    return parseJson(response);
  }
};
