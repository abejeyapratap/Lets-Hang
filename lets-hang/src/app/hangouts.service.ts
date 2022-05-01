import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const BACKEND_URL = 'http://localhost:3000/api/hangout';

@Injectable({
  providedIn: 'root',
})
export class HangoutsService {
  hangoutList: Hangout[] = [];
  distanceList: Distance[] = [];
  trainList: Distance[] = [];

  constructor(private http: HttpClient) {}

  createHangout(formData: any) {
    return this.http.post<{ message: string; hangoutId: string }>(
      `${BACKEND_URL}/create`,
      formData
    );
  }

  getHangoutInfoById(hangoutId: string) {
    return this.http.get<{
      midpoint: { lat: number; lng: number };
      hangoutSpots: Hangout[];
      distanceList: Distance[];
      trainDistance: Distance[];
    }>(`${BACKEND_URL}/${hangoutId}`);
  }

  setHangoutInfo(
    hangoutList: Hangout[],
    distanceList: Distance[],
    trainList: Distance[]
  ) {
    this.hangoutList = hangoutList;
    this.distanceList = distanceList;
    this.trainList = trainList;
  }

  fetchHangoutInfo() {
    return {
      hangouts: this.hangoutList,
      distance: this.distanceList,
      train: this.trainList,
    };
  }
}

export interface Hangout {
  name: string;
  rating: number;
  vicinity: string;
  lat: number;
  long: number;
}

export interface Distance {
  distance: string;
  time: string;
}
