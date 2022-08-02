import { Component } from '@angular/core';
import { NgxSpinner } from 'ngx-spinner/lib/ngx-spinner.enum';
import { MatDialog } from '@angular/material/dialog';

import { CrmutilService } from './services/crmutil.service';
import { ModalMicrositesComponent } from './shared/microsites-modal/microsites-modal.component';
import { ErrorModel } from './models/errorModel';
import { CustomService } from './services/custom.service';
import { ImeiToolsService } from 'src/app/services/imeitools.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'garantias-solicitudtramite';

  // Variable global de configuración para el LoaderSpinner.
  spinnerConfig: Partial<NgxSpinner> = {
    color: '#F53503',
    type: 'ball-atom',
    size: 'medium'
  };

  constructor(
    private dialog: MatDialog,
    private crmUtil: CrmutilService,
    private custom: CustomService,
    private imeiTools: ImeiToolsService) {
    console.log('Garantías QA V 29 04 2022 -Flujo 48 12:00PM');
    // Parametros usados en flujo 48 de garantías
    this.crmUtil.SetParametersGroup('48');
    // Parametros genéricos, usados en diferentes flujos
    this.crmUtil.SetParametersGroup('C5_C11').subscribe(r => {
      if (r !== false) {
        this.custom.SetParametersGroup(r);
        setTimeout(()=> {this.imeiTools.GetTypeDocument(); }, 500)
        setTimeout(() => {this.custom.CreateTransaction().next(); },1200)
      }
    });
    this.custom.GetInterceptedSource().subscribe(errorObj => this.ShowErrorModal(errorObj));
  }

  /** Método que muestra el mensaje modal con el error enviando los parámetros al micrositio de ManejoErrores.  */
  private ShowErrorModal(errorObj: ErrorModel) {
    const error= errorObj?.error;
    errorObj.error = undefined; //Este valor no es necesario en sitio de errores, si se envia falla
    errorObj.responseText = this.custom.GetMessageError + errorObj.responseText;
    let parameters = this.custom.GetParametersGroup();
    if (parameters?.URLServicios !== undefined && !this.dialog.getDialogById('errorModal')) {
      const errorUrl = parameters.URLServicios?.ManejoError + '?data=' + btoa(JSON.stringify(errorObj));
      if (parameters.WARRANTY_VALUES.AdmittedErrors500.find(x=> error?.includes(x))) { //Errores admitidos en fallas de ws, no muestra modal error
        return
      }
      this.dialog.closeAll();
      this.dialog.open(ModalMicrositesComponent, {
        width: '90%',
        height: '63%',
        id: 'errorModal',
        data: { urlSite: errorUrl, anexo: false }
      });
      this.custom.SetMessageError = '';
    }
  }
}
