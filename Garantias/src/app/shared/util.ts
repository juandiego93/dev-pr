import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { InformativeModalComponent } from './informative-modal/informative-modal.component';

type messageType = "success-alert" | "fail-alert";

@Injectable({
  providedIn: 'root'
})
export class Util {
  constructor(private dialog?: MatDialog){}

  public StringFormat(str: string, ...args: string[]): string {
    return str.replace(/{(\d+)}/g, (match, index) => args[index] || '');
  }

  public AccentToUTF8(str: string){
    str = str.split('á').join('&aacute');
    str = str.split('é').join('&eacute');
    str = str.split('í').join('&iacute');
    str = str.split('ó').join('&oacute');
    str = str.split('ú').join('&uacute');
    str = str.split('ñ').join('&ntilde');
    return str;
  }


  public OpenAlert(mensaje: string, success: boolean){
    let idModal = success ? 'success-alert' : 'fail-alert';
    const dialog = this.dialog.getDialogById(idModal);
    if(!this.dialog.getDialogById('errorModal') && !dialog){
    this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: mensaje,
      id: idModal,
      });
    }
  }

  public ActualDate(): string {
    return (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString()).substring(0, 19);
  }

  public GetCurrency(number: number): string {
    return (number).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  }
  public fullfilledField(field: any) {
    if (field === null || field === '' || field === ' ' || field === '  ' || field === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public getMessageModal(message: string, type: messageType = 'success-alert' , disableClose = true){
   if(!this.dialog.getDialogById('errorModal')){
    return this.dialog.open(InformativeModalComponent, {
      disableClose,
      data: message,
      id: type,
    });
   }
  }

}
