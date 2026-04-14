export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number; // in FCFA
  location: string;
  images: string[];
  rating: number;
  ownerId: string;
  available: boolean;
  category: string;
  seats: number;
  transmission: 'Automatique' | 'Manuelle';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
  role?: 'renter' | 'owner' | 'admin';
}

export interface Reservation {
  id: string;
  carId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
}

export interface Contract {
  id: string;
  reservationId: string;
  terms: string;
  signatureUrl?: string;
}

export interface Review {
  id: string;
  carId?: string;
  ownerId?: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
