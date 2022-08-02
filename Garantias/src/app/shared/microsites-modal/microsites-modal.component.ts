import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-microsites-modal',
  template: `<div><a [mat-dialog-close]="true" class="btn-cerrar">Cerrar</a></div>
             <div class="divBtnCancelar" *ngIf="data.anexo"><a [mat-dialog-close]="true" class="RenderButton red"><span class="btn-cancelar">Cancelar</span></a></div>
             <iframe width="100%"
              webkitallowfullscreen
              mozallowfullscreen
              class="no-overscroll"
              height="96.3%"
              [src]="data.urlSite | domSanitizer">
            </iframe>
            <style>
              ::ng-deep .mat-dialog-container {
                overflow: hidden !important;
              }
            </style>
  `
})


export class ModalMicrositesComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data) { }
}
