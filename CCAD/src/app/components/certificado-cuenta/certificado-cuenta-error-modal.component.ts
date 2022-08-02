import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-modal',
  template: `<iframe class="no-overscroll"
              height="100%"
              webkitallowfullscreen
              mozallowfullscreen
              [src]="url | domSanitizer">
             </iframe>
             `
})

export class CertificadoCuentaErrorModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public url) { }
}
