import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Hangout, HangoutsService } from '../hangouts.service';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-hangout',
  templateUrl: './hangout.component.html',
  styleUrls: ['./hangout.component.css'],
})
export class HangoutComponent implements OnInit {
  hangoutId: string;
  isLoading = false;
  hangoutList: Hangout[];
  // markerList: { position: { lat: number; lng: number } }[] = [];
  markerList: google.maps.LatLngLiteral[] = [];
  midpoint: { lat: number; lng: number };
  mapOptions: google.maps.MapOptions;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private hangoutsService: HangoutsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('hangoutId')) {
        this.router.navigateByUrl('/');
      }

      this.hangoutId = paramMap.get('hangoutId')!;

      this.isLoading = true;
      this.hangoutsService
        .getHangoutInfoById(this.hangoutId)
        .subscribe((result) => {
          console.log(result);
          this.isLoading = false;
          this.hangoutList = result.hangoutSpots.sort((a,b) => b.rating - a.rating);

          this.midpoint = result.midpoint;
          this.mapOptions = {
            center: this.midpoint,
            zoom: 14,
          };

          result.hangoutSpots.forEach((hangout) => {
            this.markerList.push({ lat: hangout.lat, lng: hangout.long });
          });
        });
    });
  }
}
