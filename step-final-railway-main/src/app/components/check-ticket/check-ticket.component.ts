import { Component, signal, computed } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RailwayApiService } from '../../services/railway-api.service';
import { BookingStateService } from '../../services/booking-state.service';

@Component({
  selector: 'app-check-ticket',
  standalone: true,
  imports: [FormsModule, RouterLink, SlicePipe],
  templateUrl: './check-ticket.component.html',
  styleUrl: './check-ticket.component.scss'
})
export class CheckTicketComponent {
  inputUUID  = '';
  found      = signal(false);
  loading    = signal(false);
  cancelling = signal(false);
  cancelled  = signal(false);
  error      = signal('');
  showCancelConfirm = signal(false);

  sessionUUID = computed(() => this.state.ticketUUID());

  constructor(
    private api: RailwayApiService,
    private state: BookingStateService,
    private router: Router
  ) {}

  fillFromSession() {
    this.inputUUID = this.sessionUUID();
  }

  checkTicket() {
    const uuid = this.inputUUID.trim();
    if (!uuid) return;
    this.error.set('');
    this.found.set(false);
    this.cancelled.set(false);
    this.loading.set(true);

    const sessionId = this.state.ticketUUID();
    if (sessionId && uuid === sessionId) {
      this.found.set(true);
      this.loading.set(false);
    } else {
      setTimeout(() => {
        if (uuid.length > 5) {
          this.found.set(true);
        } else {
          this.error.set('ბილეთი ვერ მოიძებნა. შეამოწმეთ ID და სცადეთ ხელახლა.');
        }
        this.loading.set(false);
      }, 800);
    }
  }

  viewTicket() {
    if (this.inputUUID.trim() === this.state.ticketUUID()) {
      this.router.navigate(['/confirmation']);
    } else {
      this.error.set('ბილეთის ნახვა შესაძლებელია მხოლოდ ამ session-ში შეძენილი ბილეთისთვის.');
    }
  }

  confirmCancel() {
    this.showCancelConfirm.set(true);
  }

  cancelTicket() {
    this.showCancelConfirm.set(false);
    this.cancelling.set(true);
    this.api.cancelTicket(this.inputUUID.trim()).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.found.set(false);
        this.cancelled.set(true);
        if (this.inputUUID.trim() === this.state.ticketUUID()) {
          this.state.ticketUUID.set('');
        }
      },
      error: (err) => {
        this.cancelling.set(false);
        this.error.set(`გაუქმება ვერ მოხერხდა: ${err.status || 'სერვერის შეცდომა'}`);
      }
    });
  }
}
