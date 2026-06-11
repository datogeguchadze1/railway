import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingStateService } from '../../services/booking-state.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss'
})
export class ConfirmationComponent implements OnInit {
  train      = computed(() => this.state.selectedTrain());
  params     = computed(() => this.state.searchParams());
  passengers = computed(() => this.state.passengers());
  totalPrice = computed(() => this.state.totalPrice());
  ticketUUID = computed(() => this.state.ticketUUID());
  payDate    = computed(() => this.state.payDate());
  email      = computed(() => this.state.email());
  phone      = computed(() => this.state.phone());

  constructor(private state: BookingStateService, private router: Router) {}

  ngOnInit() {
    if (!this.ticketUUID()) { this.router.navigate(['/']); }
  }
}
