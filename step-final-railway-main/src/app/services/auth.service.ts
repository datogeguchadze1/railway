import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  gender?: string;
  address?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
  verified?: boolean;
}

export interface SignInPayload { email: string; password: string; }
export interface SignUpPayload {
  firstName: string; lastName: string; age: number; gender: string;
  email: string; password: string; address: string; phone: string;
  zipcode: string; avatar?: string;
}
export interface UpdatePayload {
  firstName: string; lastName: string; age: number; gender: string;
  email: string; address: string; phone: string; zipcode: string; avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = 'https://api.everrest.educata.dev';
  currentUser = signal<AuthUser | null>(null);
  isLoggedIn = signal(false);

  constructor(private http: HttpClient) {

    if (this.token) {
      this.fetchMe().subscribe({ error: () => this.clearSession() });
    }
  }

  get token(): string | null { return localStorage.getItem('access_token'); }

  signIn(payload: SignInPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/sign_in`, payload).pipe(
      tap(data => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        this.isLoggedIn.set(true);
      })
    );
  }

  signUp(payload: SignUpPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/auth/sign_up`, payload);
  }

  signOut(): void {
    if (this.token) {
      this.http.post(`${this.base}/auth/sign_out`, {}).subscribe({ error: () => {} });
    }
    this.clearSession();
  }

  fetchMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/auth`).pipe(
      tap(user => { this.currentUser.set(user); this.isLoggedIn.set(true); })
    );
  }

  updateProfile(payload: UpdatePayload): Observable<any> {
    return this.http.patch<any>(`${this.base}/auth/update`, payload).pipe(
      tap(data => this.currentUser.update(u => u ? { ...u, ...data } : u))
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/auth/change_password`, { oldPassword, newPassword }).pipe(
      tap(data => {
        if (data.access_token) localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      })
    );
  }

  public clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }
}
