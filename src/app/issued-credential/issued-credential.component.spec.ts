import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuedCredentialComponent } from './issued-credential.component';

describe('IssuedCredentialComponent', () => {
  let component: IssuedCredentialComponent;
  let fixture: ComponentFixture<IssuedCredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssuedCredentialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuedCredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
