import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-informativo',
  template: `<div style="text-align: center;">
  <i class="fas fa-info-circle" style="padding: 0px 10px;"></i>{{data}}
  <button mat-dialog-close (click)="onCerrar()" class="btnAlert"><i class="fas text-white fa-times"></i></button>
</div>`
})
export class ModalInformativoComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data,
              public dialogRef: MatDialogRef<ModalInformativoComponent>
) {
  console.log(data);
}

  onCerrar(): void {
    this.dialogRef.close();
  }
}
