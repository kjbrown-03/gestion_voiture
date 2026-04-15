export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  images: string[];
  rating: number;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
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
  type?: 'rental' | 'reservation';
  createdAt?: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  carName?: string | null;
  ownerName?: string | null;
  renterName?: string | null;
}

export interface Invoice {
  invoiceId: string | null;
  invoiceNumber: string;
  reservationId: string;
  type: 'rental' | 'reservation';
  status: string;
  issuedAt: string;
  startDate: string;
  endDate: string;
  amountNet: number;
  serviceFee: number;
  total: number;
  carName: string;
  ownerName: string;
  renterName: string;
  renterEmail?: string;
  ownerEmail?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reservation' | 'rental' | 'invoice' | 'security';
  isRead: boolean;
  createdAt: string;
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
