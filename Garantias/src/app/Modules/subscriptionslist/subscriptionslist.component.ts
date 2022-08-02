import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Service } from './../../models/subscriberPackages';

@Component({
  selector: 'app-subscriptionslist',
  templateUrl: './subscriptionslist.component.html',
  styleUrls: ['./subscriptionslist.component.scss']
})
export class SubscriptionsListComponent {

  public displayedColumns: string[] = ['min', 'type', 'status', 'select'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Service[],
  public dialogRef: MatDialogRef<SubscriptionsListComponent>) { }

  public SelectedSuscription(service: Service): void {
    this.dialogRef.close(service);
  }
}



