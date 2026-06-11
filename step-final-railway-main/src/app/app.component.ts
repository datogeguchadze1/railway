import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="page-wrapper">
      <app-header />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class AppComponent {}
