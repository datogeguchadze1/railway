export interface Station {
  id: number;
  name: string;
}

export interface Train {
  id: number;
  number: string;
  departure: string;
  arrive: string;
}

export interface Departure {
  source: string;
  destination: string;
  date: string;
  trains: Train[];
}

export interface Seat {
  seatId: string;
  number: string;
  isOccupied: boolean;
  price: number;
  status: string;
}

export interface Vagon {
  id: number;
  name: string;
  trainId: number;
}

export interface VagonWithSeats {
  seats: Seat[];
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  weekday: string;
  passengers: number;
}

export interface PassengerEntry {
  seatId: string | null;
  seatNumber: string;
  seatPrice: number;
  name: string;
  surname: string;
  idNumber: string;
  status: string;
  payoutCompleted: boolean;
}

export interface TicketPayload {
  trainId: number;
  date: string;
  email: string;
  phoneNumber: string;
  people: {
    seatId: string | null;
    name: string;
    surname: string;
    idNumber: string;
    status: string;
    payoutCompleted: boolean;
  }[];
}
