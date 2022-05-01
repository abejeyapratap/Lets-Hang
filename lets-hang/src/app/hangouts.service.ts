import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HangoutsService {
  constructor(private http: HttpClient) {}

  createHangout(formData: any) {
    return this.http.post('http://localhost:3000/api/hangout/create', formData);
  }
}
