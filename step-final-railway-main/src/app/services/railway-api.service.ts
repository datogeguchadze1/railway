import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station, Departure, Vagon, VagonWithSeats, TicketPayload } from '../models/railway.models';

@Injectable({ providedIn: 'root' })
export class RailwayApiService {
  private readonly base = 'https://railway.stepprojects.ge/api';

  constructor(private http: HttpClient) {}

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.base}/stations`);
  }

  getDepartures(): Observable<Departure[]> {
    return this.http.get<Departure[]>(`${this.base}/departures`);
  }

  getVagons(): Observable<Vagon[]> {
    return this.http.get<Vagon[]>(`${this.base}/vagons`);
  }

  getVagonDetails(id: number): Observable<VagonWithSeats[]> {
    return this.http.get<VagonWithSeats[]>(`${this.base}/getvagon/${id}`);
  }

  getTrainDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/trains/${id}`);
  }

  registerTicket(data: TicketPayload): Observable<string> {
    return this.http.post(`${this.base}/tickets/register`, data, { responseType: 'text' });
  }

  cancelTicket(uuid: string): Observable<string> {
    return this.http.delete(`${this.base}/tickets/cancel/${encodeURIComponent(uuid)}`, { responseType: 'text' });
  }
  checkTicketStatus(uuid: string): Observable<any> {
    return this.http.get<any>(`${this.base}/tickets/checkstatus/${encodeURIComponent(uuid)}`);
  }

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tickets`);
  }
}
