import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UpdatePayload } from '../../services/auth.service';
import { RailwayApiService } from '../../services/railway-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private railwayApi = inject(RailwayApiService);
  private router = inject(Router);

  user = this.authService.currentUser;
  loadingTickets = signal(true);
  tickets = signal<any[]>([]);
  cancellingId = signal<string | null>(null);
  checkingId = signal<string | null>(null);
  ticketMsg = signal<{id: string; type: 'success'|'error'; text: string} | null>(null);

  updatingProfile = signal(false);
  changingPass = signal(false);
  updateAlert = signal(''); updateAlertType = signal('success');
  passAlert = signal(''); passAlertType = signal('success');

  cpOld = ''; cpNew = ''; cpConf = '';
  showOld = false; showNew = false; showConf = false;

  f: any = { firstName:'', lastName:'', age:0, gender:'MALE', email:'', address:'', phone:'', zipcode:'', avatar:'' };

  ngOnInit() {
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.fillForm();
    this.loadTickets();
  }

  fillForm() {
    const u = this.user();
    if (!u) return;
    this.f = { firstName: u.firstName||'', lastName: u.lastName||'', age: u.age||0, gender: u.gender||'MALE', email: u.email||'', address: u.address||'', phone: u.phone||'', zipcode: u.zipcode||'', avatar: u.avatar||'' };
  }

  loadTickets() {
    this.loadingTickets.set(true);
    this.railwayApi.getTickets().subscribe({
      next: (data: any[]) => {
        this.tickets.set(Array.isArray(data) ? data : []);
        this.loadingTickets.set(false);
      },
      error: () => { this.tickets.set([]); this.loadingTickets.set(false); }
    });
  }

  checkTicket(t: any) {
    const id = this.getTicketId(t);
    if (!id) return;
    this.checkingId.set(id);
    this.ticketMsg.set(null);

    this.railwayApi.checkTicketStatus(id).subscribe({
      next: (data: any) => {
        this.checkingId.set(null);
        const status = data?.status || (data?.paymentCompleted ? 'გადახდილი' : 'მოლოდინი');
        this.ticketMsg.set({ id, type: 'success', text: `სტატუსი: ${status}` });
        this.tickets.update(list => list.map(x =>
          this.getTicketId(x) === id ? { ...x, ...data } : x
        ));
      },
      error: () => {
        this.checkingId.set(null);
        this.ticketMsg.set({ id, type: 'error', text: 'სტატუსი ვერ მოიძებნა' });
      }
    });
  }

  cancelTicket(t: any) {
    const id = this.getTicketId(t);
    if (!id || !confirm('დარწმუნებული ხართ, რომ გსურთ ბილეთის გაუქმება?')) return;
    this.cancellingId.set(id);
    this.ticketMsg.set(null);

    this.railwayApi.cancelTicket(id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.tickets.update(list => list.filter(x => this.getTicketId(x) !== id));
        this.ticketMsg.set({ id: 'global', type: 'success', text: '✅ ბილეთი წარმატებით გაუქმდა' });
        setTimeout(() => this.ticketMsg.set(null), 3000);
      },
      error: () => {
        this.cancellingId.set(null);
        this.ticketMsg.set({ id, type: 'error', text: 'გაუქმება ვერ მოხერხდა' });
      }
    });
  }

  avatarSrc() {
    return this.user()?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.user()?.email || 'user'}`;
  }
  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=user`;
  }

  doUpdate() {
    this.updateAlert.set('');
    if (!this.f.firstName||!this.f.lastName||!this.f.email||!this.f.address||!this.f.phone||!this.f.zipcode) {
      this.updateAlertType.set('error'); this.updateAlert.set('❌ გთხოვთ შეავსოთ ყველა ველი'); return;
    }
    this.updatingProfile.set(true);
    this.authService.updateProfile(this.f as UpdatePayload).subscribe({
      next: () => { this.updatingProfile.set(false); this.updateAlertType.set('success'); this.updateAlert.set('✅ პროფილი წარმატებით განახლდა!'); },
      error: (err: any) => { this.updatingProfile.set(false); this.updateAlertType.set('error'); this.updateAlert.set('❌ ' + (err?.error?.message || 'განახლება ვერ მოხერხდა')); }
    });
  }

  doChangePass() {
    this.passAlert.set('');
    if (!this.cpOld||!this.cpNew||!this.cpConf) { this.passAlertType.set('error'); this.passAlert.set('❌ შეავსეთ ყველა ველი'); return; }
    if (this.cpNew.length < 8) { this.passAlertType.set('error'); this.passAlert.set('❌ ახალი პაროლი მინიმუმ 8 სიმბოლო'); return; }
    if (this.cpNew !== this.cpConf) { this.passAlertType.set('error'); this.passAlert.set('❌ პაროლები არ ემთხვევა'); return; }
    if (this.cpOld === this.cpNew) { this.passAlertType.set('error'); this.passAlert.set('❌ ახალი პაროლი განსხვავებული უნდა იყოს'); return; }
    this.changingPass.set(true);
    this.authService.changePassword(this.cpOld, this.cpNew).subscribe({
      next: () => { this.changingPass.set(false); this.passAlertType.set('success'); this.passAlert.set('✅ პაროლი წარმატებით შეიცვალა!'); this.cpOld=''; this.cpNew=''; this.cpConf=''; },
      error: (err: any) => { this.changingPass.set(false); this.passAlertType.set('error'); this.passAlert.set('❌ ' + (err?.error?.message || 'პაროლის შეცვლა ვერ მოხერხდა')); }
    });
  }

  getTicketId(t: any): string {
    return String(t.id || t._id || t.uuid || '');
  }

  getTicketFrom(t: any): string {
    return t.train?.fromStation || t.train?.station
        || t.departure?.fromStation || t.from || '—';
  }

  getTicketTo(t: any): string {
    return t.train?.toStation || t.departure?.toStation
        || t.to || '—';
  }

  getPassengers(t: any): any[] {
    return Array.isArray(t.people) ? t.people : [];
  }

  formatDate(d: string): string {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ka-GE', { day:'numeric', month:'long', year:'numeric' });
  }
}
