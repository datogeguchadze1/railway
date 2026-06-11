import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  firstName=''; lastName=''; age: number|null=null; gender='';
  email=''; password=''; address=''; phone=''; zipcode=''; avatar='';
  showPass=false;
  loading = signal(false);
  alertMsg = signal(''); alertType = signal('error');

  constructor(private auth: AuthService, private router: Router) {}

  doSignUp() {
    this.alertMsg.set('');
    if (!this.firstName||!this.lastName||!this.email||!this.password||!this.address||!this.phone||!this.zipcode) {
      this.alertMsg.set('❌ გთხოვთ შეავსოთ ყველა სავალდებულო ველი'); return;
    }
    if (!this.gender) { this.alertMsg.set('❌ გთხოვთ აირჩიოთ სქესი'); return; }
    if (!this.age || this.age < 1) { this.alertMsg.set('❌ ასაკი სწორად შეიყვანეთ'); return; }
    if (this.password.length < 8) { this.alertMsg.set('❌ პაროლი მინიმუმ 8 სიმბოლო'); return; }

    this.loading.set(true);
    const avatar = this.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${Date.now()}`;
    this.auth.signUp({ firstName: this.firstName, lastName: this.lastName, age: this.age!, gender: this.gender, email: this.email, password: this.password, address: this.address, phone: this.phone, zipcode: this.zipcode, avatar }).subscribe({
      next: () => {
        this.loading.set(false);
        this.alertType.set('success');
        this.alertMsg.set('✅ წარმატებულია! შეამოწმეთ ელ-ფოსტა ვერიფიკაციისთვის.');
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertType.set('error');
        this.alertMsg.set('❌ ' + (err?.error?.message || 'რეგისტრაცია ვერ მოხერხდა'));
      }
    });
  }
}
