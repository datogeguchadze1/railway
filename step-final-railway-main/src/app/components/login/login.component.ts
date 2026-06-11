import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = ''; password = ''; showPass = false;
  loading = signal(false);
  alertMsg = signal(''); alertType = signal('error');

  constructor(private auth: AuthService, private router: Router) {}

  doSignIn() {
    this.alertMsg.set('');
    if (!this.email || !this.password) { this.alertMsg.set('❌ გთხოვთ შეავსოთ ყველა ველი'); return; }
    this.loading.set(true);
    this.auth.signIn({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.auth.fetchMe().subscribe({
          next: () => { this.loading.set(false); this.router.navigate(['/']); },
          error: () => { this.loading.set(false); this.router.navigate(['/']); }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.alertType.set('error');
        this.alertMsg.set('❌ ' + (err?.error?.message || 'შეცდომა, სცადეთ ხელახლა'));
      }
    });
  }
}
