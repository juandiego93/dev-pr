import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-notificacion',
  templateUrl: './modal-notificacion.component.html',
  styleUrls: ['./modal-notificacion.component.scss']
})
export class ModalNotificacionComponent implements OnInit {


  constructor(@Inject(MAT_DIALOG_DATA) public data,
              public dialogRef: MatDialogRef<ModalNotificacionComponent>) { }

  ngOnInit(): void {}

  onCerrar(): void {
    this.dialogRef.close();
  }

}
