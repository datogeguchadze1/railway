import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { bookingGuard } from './guards/booking.guard';

export const routes: Routes = [
  {
     path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) 
    },
  {
     path: 'trains', loadComponent: () => import('./components/trains/trains.component').then(m => m.TrainsComponent), canActivate: [bookingGuard]
     },
  {
     path: 'passenger-details', loadComponent: () => import('./components/passenger-details/passenger-details.component').then(m => m.PassengerDetailsComponent), canActivate: [bookingGuard] 
    },
  {
     path: 'payment', loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent), canActivate: [bookingGuard] 
    
  },
  { 
    path: 'confirmation', loadComponent: () => import('./components/confirmation/confirmation.component').then(m => m.ConfirmationComponent), canActivate: [bookingGuard] 
    
  },
  { 
    path: 'check-ticket', loadComponent: () => import('./components/check-ticket/check-ticket.component').then(m => m.CheckTicketComponent) 
    
  },
  { 
    path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard]
    
   },
  { 
    path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard]
    
   },
  { 
    path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] 
    
  },
  { 
    path: '**', loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) 
    
  }
];
