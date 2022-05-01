import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Distance, HangoutsService } from '../hangouts.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  hangoutId: string;
  distanceList: Distance[] = [];
  trainList: Distance[] = [];
  carbonList: number[] = []
  coeff = 19.564;

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

      let data = this.hangoutsService.fetchHangoutInfo();
      this.distanceList = data.distance;
      for (let i =0; i < this.distanceList.length; i++) {
        this.carbonList.push(parseInt(this.distanceList[i].distance));
      }
      this.trainList = data.train;
    });
  }
}
