import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotificacionComponent } from './modal-notificacion.component';

describe('ModalNotificacionComponent', () => {
  let component: ModalNotificacionComponent;
  let fixture: ComponentFixture<ModalNotificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalNotificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
