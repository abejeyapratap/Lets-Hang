import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HangoutsService } from '../hangouts.service';

@Component({
  selector: 'app-hangout',
  templateUrl: './hangout.component.html',
  styleUrls: ['./hangout.component.css'],
})
export class HangoutComponent implements OnInit {
  hangoutId: string;
  isLoading = false;

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
          this.isLoading = false;
          console.log(result);
        });
    });
  }
}
