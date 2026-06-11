import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { RailwayApiService } from '../../services/railway-api.service';
import { BookingStateService } from '../../services/booking-state.service';
import { Train, Departure } from '../../models/railway.models';
import { forkJoin } from 'rxjs';

interface TrainWithPopularity extends Train {
  booked: number;
  total: number;
  percent: number;
  loadingPop: boolean;
}

@Component({
  selector: 'app-trains',
  standalone: true,
  imports: [],
  templateUrl: './trains.component.html',
  styleUrl: './trains.component.scss'
})
export class TrainsComponent implements OnInit {
  params  = computed(() => this.state.searchParams());
  trains  = signal<TrainWithPopularity[]>([]);
  loading = signal(true);
  error   = signal('');

  constructor(
    private api: RailwayApiService,
    private state: BookingStateService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.params()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadTrains();
  }

  goBack() { this.router.navigate(['/']); }

  loadTrains() {
    this.loading.set(true);
    this.api.getDepartures().subscribe({
      next: data => {
        const p = this.params()!;
        let found: Train[] = [];
        data.forEach((dep: Departure) => {
          if (dep.source === p.from && dep.destination === p.to && dep.date === p.weekday) {
            dep.trains.forEach(t => {
              if (!this.state.usedTrainIds.includes(String(t.id))) {
                found.push(t);
              }
            });
          }
        });
        this.trains.set(found.map(t => ({ ...t, booked: 0, total: 0, percent: 0, loadingPop: true })));
        this.loading.set(false);
        found.forEach((t: Train) => this.loadPopularity(t.id));
      },
      error: () => {
        this.error.set('მონაცემების ჩატვირთვა ვერ მოხერხდა');
        this.loading.set(false);
      }
    });
  }

  loadPopularity(trainId: number) {
    this.api.getTrainDetails(trainId).subscribe({
      next: (data: any) => {
        const vagonRequests = data.vagons.map((v: any) => this.api.getVagonDetails(v.id));
        (forkJoin(vagonRequests) as import('rxjs').Observable<any[]>).subscribe({
          next: (results: any[]) => {
            let booked = 0, total = 0;
            results.forEach(vd => {
              vd?.[0]?.seats?.forEach((s: any) => { total++; if (s.isOccupied) booked++; });
            });
            const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
            this.trains.update(list =>
              list.map(t => t.id === trainId ? { ...t, booked, total, percent, loadingPop: false } : t)
            );
          },
          error: () => this.trains.update(list =>
            list.map(t => t.id === trainId ? { ...t, loadingPop: false } : t)
          )
        });
      },
      error: () => this.trains.update(list =>
        list.map(t => t.id === trainId ? { ...t, loadingPop: false } : t)
      )
    });
  }

  selectTrain(train: Train) {
    this.state.selectedTrain.set(train);
    this.state.addUsedTrain(train.id);
    this.router.navigate(['/passenger-details']);
  }
}
