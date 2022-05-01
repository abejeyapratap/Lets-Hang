import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HangoutsService } from '../hangouts.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
  date: string;
  time: string;
  commute: number;
  friend1: Friend = { emoji: '', address: '' };
  friend2: Friend = { emoji: '', address: '' };
  friend3: Friend = { emoji: '', address: '' };

  constructor(
    private http: HttpClient,
    private hangoutsService: HangoutsService
  ) {}

  ngOnInit() {}

  onSubmit(form: NgForm) {
    console.log(form.value);

    let formData = {
      date: this.date,
      time: this.time,
      commute: this.commute,
      friend1: this.friend1,
      friend2: this.friend2,
      friend3: this.friend3,
    };

    this.hangoutsService.createHangout(formData).subscribe((response) => {
      console.log(response);
    });
  }
}

interface Friend {
  emoji: string;
  address: string;
}
