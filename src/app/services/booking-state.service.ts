import { Injectable, signal } from '@angular/core';
import { SearchParams, Train, PassengerEntry, TicketPayload } from '../models/railway.models';

@Injectable({ providedIn: 'root' })
export class BookingStateService {

  searchParams = signal<SearchParams | null>(null);
  selectedTrain = signal<Train | null>(null);
  passengers    = signal<PassengerEntry[]>([]);
  ticketPayload = signal<TicketPayload | null>(null);

  totalPrice  = signal<number>(0);
  ticketUUID  = signal<string>('');
  payDate     = signal<string>('');
  email       = signal<string>('');
  phone       = signal<string>('');


  private _used: string[] = JSON.parse(localStorage.getItem('usedTrainIds') || '[]');
  get usedTrainIds() { return this._used; }
  addUsedTrain(id: string | number) {
    const s = String(id);
    if (!this._used.includes(s)) {
      this._used.push(s);
      localStorage.setItem('usedTrainIds', JSON.stringify(this._used));
    }
  }

  georgianWeekday(dateStr: string): string {
    const days = ['კვირა','ორშაბათი','სამშაბათი','ოთხშაბათი','ხუთშაბათი','პარასკევი','შაბათი'];
    return days[new Date(dateStr).getDay()];
  }

  reset() {
    this.searchParams.set(null);
    this.selectedTrain.set(null);
    this.passengers.set([]);
    this.ticketPayload.set(null);
    this.totalPrice.set(0);
    this.ticketUUID.set('');
    this.payDate.set('');
    this.email.set('');
    this.phone.set('');
  }
}
