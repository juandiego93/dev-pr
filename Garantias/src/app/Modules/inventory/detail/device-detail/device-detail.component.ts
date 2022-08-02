import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Util } from 'src/app/shared/util';
import { Device } from 'src/app/models/device';
import { DeviceValues } from './../../../../models/device';

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.component.html',
  styleUrls: ['./device-detail.component.scss']
})
export class DeviceDetailComponent {

  public deviceValues = new DeviceValues();
  //public isOld: boolean;
  public brands: string[] = ["SAMSUNG", "LG", "HUAWEI"];
  public models: string[] = ["Model 1", "Model 2"];
  public stateDevice: string[] = ["Stock libre utilización", "Equipo en prestamo", "Reservado"];

  private util = new Util(this.dialog);

  constructor(@Inject(MAT_DIALOG_DATA) public device: Device,
    public dialogRef: MatDialogRef<DeviceDetailComponent>,
    private dialog: MatDialog) { }

  public SubmitInternalCase(): void {
    let invalidFilds = 0;
    for (const prop in this.device) {
      if (prop !== 'equipmentOnLoan' && !this.OnKeyUp(this.device[prop], prop)) {
        invalidFilds++;
      }
    }
    if (invalidFilds > 0) {
      return;
    }
    this.dialog.closeAll();
    this.util.OpenAlert('Inventario modificado exitosamente.', true)
  }

  public OnKeyUp(val: string, box: string): boolean {
    this.deviceValues[box] = false;
    if (val === "" || (val !== "" && !val?.toString().match(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s\.\,]+$/g))) {
      this.deviceValues[box] = true;
      return false;
    } else {
   return true;
    }
  }

  public onReserve(): void {
    this.dialogRef.close('Reserva');
  }

  public onCancel(): void {
    this.dialogRef.close('Cancela');
  }

}
