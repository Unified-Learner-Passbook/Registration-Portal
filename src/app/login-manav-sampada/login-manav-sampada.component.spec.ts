import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginManavSampadaComponent } from './login-manav-sampada.component';

describe('LoginManavSampadaComponent', () => {
  let component: LoginManavSampadaComponent;
  let fixture: ComponentFixture<LoginManavSampadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginManavSampadaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginManavSampadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
