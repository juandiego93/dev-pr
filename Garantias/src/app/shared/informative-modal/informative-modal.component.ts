import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-informative-modal',
  templateUrl: './informative-modal.component.html'
})
export class InformativeModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data
) { }
}
