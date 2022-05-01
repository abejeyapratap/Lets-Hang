import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangoutComponent } from './hangout.component';

describe('HangoutComponent', () => {
  let component: HangoutComponent;
  let fixture: ComponentFixture<HangoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HangoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HangoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
