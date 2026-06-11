import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RailwayApiService } from '../../services/railway-api.service';
import { BookingStateService } from '../../services/booking-state.service';
import { PassengerEntry, Vagon, Seat } from '../../models/railway.models';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './passenger-details.component.html',
  styleUrl: './passenger-details.component.scss'
})
export class PassengerDetailsComponent implements OnInit {
  params  = computed(() => this.state.searchParams());
  train   = computed(() => this.state.selectedTrain());
  passengers = signal<PassengerEntry[]>([]);
  totalPrice = computed(() => this.passengers().reduce((s, p) => s + (p.seatPrice || 0), 0));

  email = '';
  phone = '';
  formError = signal('');

  showVagonModal = signal(false);
  showSeatModal  = signal(false);
  loadingVagons  = signal(false);
  loadingSeats   = signal(false);
  vagons  = signal<Vagon[]>([]);
  seats   = signal<Seat[]>([]);

  private currentPassengerIdx = -1;

  constructor(
    private api: RailwayApiService,
    private state: BookingStateService,
    private router: Router
  ) {}

  ngOnInit() {
    const t = this.train();
    if (!t) { this.router.navigate(['/']); return; }
    const count = this.params()?.passengers ?? 1;
    this.passengers.set(Array.from({ length: count }, () => ({
      seatId: null, seatNumber: '', seatPrice: 0,
      name: '', surname: '', idNumber: '',
      status: 'isOccupied', payoutCompleted: false
    })));
  }

  goBack() { this.router.navigate(['/trains']); }

  openVagonModal(idx: number) {
    this.currentPassengerIdx = idx;
    this.showVagonModal.set(true);
    this.loadingVagons.set(true);
    this.api.getVagons().subscribe({
      next: vagons => {
        this.vagons.set(vagons.filter(v => v.trainId == this.train()!.id));
        this.loadingVagons.set(false);
      },
      error: () => this.loadingVagons.set(false)
    });
  }
  closeVagonModal() { this.showVagonModal.set(false); }

  selectVagon(v: Vagon) {
    this.showVagonModal.set(false);
    this.showSeatModal.set(true);
    this.loadingSeats.set(true);
    this.api.getVagonDetails(v.id).subscribe({
      next: data => {
        const sorted = [...(data[0]?.seats ?? [])].sort((a, b) => {
          const mA = a.number.match(/^(\d+)([A-Z])$/);
          const mB = b.number.match(/^(\d+)([A-Z])$/);
          if (!mA || !mB) return a.number.localeCompare(b.number);
          if (+mA[1] !== +mB[1]) return +mA[1] - +mB[1];
          return mA[2].localeCompare(mB[2]);
        });
        this.seats.set(sorted);
        this.loadingSeats.set(false);
      },
      error: () => this.loadingSeats.set(false)
    });
  }

  closeSeatModal() { this.showSeatModal.set(false); }

  getCurrentSeat(): string | null {
    return this.passengers()[this.currentPassengerIdx]?.seatId ?? null;
  }

  isSeatTakenByOther(seatId: string): boolean {
    return this.passengers().some((p, i) => i !== this.currentPassengerIdx && p.seatId === seatId);
  }

  selectSeat(seat: Seat) {
    if (seat.isOccupied && this.getCurrentSeat() !== seat.seatId) return;
    this.passengers.update(list => {
      const updated = [...list];
      const p = { ...updated[this.currentPassengerIdx] };
      if (p.seatId === seat.seatId) {
        p.seatId = null; p.seatNumber = ''; p.seatPrice = 0;
      } else {
        p.seatId = seat.seatId; p.seatNumber = seat.number; p.seatPrice = seat.price;
      }
      updated[this.currentPassengerIdx] = p;
      return updated;
    });
    this.showSeatModal.set(false);
  }

  proceed() {
    if (!this.email.trim() || !this.phone.trim()) {
      this.formError.set('გთხოვთ, შეავსოთ ელ.ფოსტა და ტელეფონი');
      return;
    }
    const ps = this.passengers();
    for (let i = 0; i < ps.length; i++) {
      if (!ps[i].name.trim()) { this.formError.set(`მგზავრი ${i+1}: სახელი ცარიელია`); return; }
      if (!ps[i].surname.trim()) { this.formError.set(`მგზავრი ${i+1}: გვარი ცარიელია`); return; }
      if (!ps[i].idNumber.trim()) { this.formError.set(`მგზავრი ${i+1}: პირადი ნომერი ცარიელია`); return; }
      if (!ps[i].seatId) { this.formError.set(`მგზავრი ${i+1}: ადგილი არ არის არჩეული`); return; }
    }
    this.formError.set('');
    this.state.email.set(this.email.trim());
    this.state.phone.set(this.phone.trim());
    this.state.passengers.set(ps);
    this.state.totalPrice.set(this.totalPrice());
    this.state.ticketPayload.set({
      trainId: this.train()!.id,
      date: this.params()!.date,
      email: this.email.trim(),
      phoneNumber: this.phone.trim(),
      people: ps.map(p => ({
        seatId: p.seatId,
        name: p.name,
        surname: p.surname,
        idNumber: p.idNumber,
        status: 'isOccupied',
        payoutCompleted: false
      }))
    });
    this.router.navigate(['/payment']);
  }
}
