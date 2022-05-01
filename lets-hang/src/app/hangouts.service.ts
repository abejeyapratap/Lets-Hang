import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const BACKEND_URL = 'http://localhost:3000/api/hangout';

@Injectable({
  providedIn: 'root',
})
export class HangoutsService {
  constructor(private http: HttpClient) {}

  createHangout(formData: any) {
    return this.http.post<{ message: string; hangoutId: string }>(
      `${BACKEND_URL}/create`,
      formData
    );
  }

  getHangoutInfoById(hangoutId: string) {
    return this.http.get<{ midpoint: {lat: number, lng: number}, hangoutSpots: Hangout[]; distanceList: number[] }>(
      `${BACKEND_URL}/${hangoutId}`
    );
  }
}

export interface Hangout {
  name: string;
  rating: number;
  vicinity: string;
  lat: number;
  long: number;
}
