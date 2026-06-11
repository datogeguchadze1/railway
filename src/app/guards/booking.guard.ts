import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingStateService } from '../services/booking-state.service';

export const bookingGuard: CanActivateFn = (route) => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  const path = route.routeConfig?.path;

  if (path === 'trains') {
    return state.searchParams() ? true : router.createUrlTree(['/']);
  }
  if (path === 'passenger-details') {
    return state.selectedTrain() ? true : router.createUrlTree(['/trains']);
  }
  if (path === 'payment') {
    return state.ticketPayload() ? true : router.createUrlTree(['/passenger-details']);
  }
  if (path === 'confirmation') {
    return state.ticketUUID() ? true : router.createUrlTree(['/']);
  }
  return true;
};
