import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterEntityComponent } from './register-entity.component';

describe('RegisterEntityComponent', () => {
  let component: RegisterEntityComponent;
  let fixture: ComponentFixture<RegisterEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterEntityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
