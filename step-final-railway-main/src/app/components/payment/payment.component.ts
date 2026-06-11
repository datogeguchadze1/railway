import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RailwayApiService } from '../../services/railway-api.service';
import { BookingStateService } from '../../services/booking-state.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  params     = computed(() => this.state.searchParams());
  train      = computed(() => this.state.selectedTrain());
  passengers = computed(() => this.state.passengers());
  totalPrice = computed(() => this.state.totalPrice());

  cardNumber = '';
  cardHolder = '';
  expiry     = '';
  cvc        = '';
  showBack   = false;

  loading = signal(false);
  error   = signal('');

  constructor(
    private api: RailwayApiService,
    private state: BookingStateService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.state.ticketPayload()) { this.router.navigate(['/']); }
  }

  goBack() { this.router.navigate(['/passenger-details']); }

  formatCard(e: Event) {
    let val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = val.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry(e: Event) {
    let val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    this.expiry = val;
  }

  formatCardPreview(num: string): string {
    const clean = num.replace(/\s/g, '');
    const padded = clean.padEnd(16, '•');
    return padded.replace(/(.{4})/g, '$1 ').trim();
  }

  pay() {
    if (!this.cardNumber.trim() || !this.cardHolder.trim() || !this.expiry.trim() || !this.cvc.trim()) {
      this.error.set('გთხოვთ, შეავსოთ ყველა ველი!');
      return;
    }
    this.error.set('');
    this.loading.set(true);

    const payload = this.state.ticketPayload()!;
    payload.people.forEach(p => p.payoutCompleted = true);

    this.api.registerTicket(payload).subscribe({
      next: (res: string) => {
        const uuid = res.substring(res.indexOf(':') + 1).trim();
        const now = new Date();
        const payDate = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${now.getFullYear()}`;
        this.state.ticketUUID.set(uuid);
        this.state.payDate.set(payDate);
        this.loading.set(false);
        this.router.navigate(['/confirmation']);
      },
      error: () => {
        this.error.set('გადახდა ვერ მოხერხდა. გთხოვთ სცადოთ ხელახლა.');
        this.loading.set(false);
      }
    });
  }
}
