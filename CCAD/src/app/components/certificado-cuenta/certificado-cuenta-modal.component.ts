import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-certificado-cuenta-modal',
  template: `<div><a [mat-dialog-close] class="btn-cerrar">Cerrar</a></div>
             <iframe width="100%"
              webkitallowfullscreen
              mozallowfullscreen
              class="no-overscroll"
              height="100%"
              [src]="data | domSanitizer">
            </iframe>
            <style>
              ::ng-deep .mat-dialog-container {
                overflow: hidden !important;
              }
            </style>
  `
})
export class CertificadoCuentaModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data) { }
}

// <div class="divBtnCancelar"><a [mat-dialog-close] class="btn-cancelar RenderButton red">Cancelar</a></div>