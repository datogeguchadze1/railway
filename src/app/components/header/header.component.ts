import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  avatarSrc() {
    return this.auth.currentUser()?.avatar ||
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.auth.currentUser()?.email || 'user'}`;
  }

  onAvatarError(e: Event) {
    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=user`;
  }

  signOut() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
}
