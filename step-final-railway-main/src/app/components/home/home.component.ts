import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RailwayApiService } from '../../services/railway-api.service';
import { BookingStateService } from '../../services/booking-state.service';
import { Station } from '../../models/railway.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  stations  = signal<Station[]>([]);
  loading   = signal(false);
  error     = signal('');

  from       = '';
  to         = '';
  date       = '';
  passengers = 1;
  today      = new Date().toISOString().split('T')[0];

  constructor(
    private api: RailwayApiService,
    private state: BookingStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getStations().subscribe({
      next: data => this.stations.set(data),
      error: () => this.error.set('სადგურების ჩატვირთვა ვერ მოხერხდა')
    });
  }

  swapCities() {
    [this.from, this.to] = [this.to, this.from];
  }

  onSearch() {
    if (!this.from || !this.to || !this.date || !this.passengers) {
      this.error.set('გთხოვთ, შეავსოთ ყველა ველი!');
      return;
    }
    if (this.from === this.to) {
      this.error.set('გამგზავრებისა და ჩასვლის სადგური არ უნდა ემთხვეოდეს!');
      return;
    }
    this.error.set('');
    this.state.searchParams.set({
      from: this.from,
      to: this.to,
      date: this.date,
      weekday: this.state.georgianWeekday(this.date),
      passengers: +this.passengers
    });
    this.router.navigate(['/trains']);
  }
}
