import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeriPehchaanComponent } from './meri-pehchaan.component';

describe('MeriPehchaanComponent', () => {
  let component: MeriPehchaanComponent;
  let fixture: ComponentFixture<MeriPehchaanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeriPehchaanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeriPehchaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
