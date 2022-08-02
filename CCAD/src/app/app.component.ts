import { SimpleGlobal } from 'ng2-simple-global';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResponseParameter, MensajesAplicacion } from './models/response-model/ResponseParameter';
import { RequestParameter } from './models/requests-models/resquestParameter';
import { FinalizaratencionComponent } from './components/finalizar-atencion/finalizar-atencion.component';
import { MatDialog } from '@angular/material/dialog';
import { RequestKnowledgeBase } from './models/requests-models/requestKnowledgeBase';
import { CertificacionCuentaService } from './services/certicacion-cuenta.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'certificacion-cuenta';
  responseParameter: ResponseParameter;
  requestParameter = new RequestParameter();
  paramClassFlujos: MensajesAplicacion;
  idService: '05';
  idTurn: string;
  biHeaderId: string;
  FlujoOK = false;
  dataModal: RequestKnowledgeBase = {
    strNameFunctionality: 'CUENTASALDIA',
    strNameKnowledge: 'CERTIFICADOCUENTAALDIA',
    strNameProcess: 'CERTIFICADOCUENTAALDIA'
  };
  URLReturn: string;

  constructor(
    private sg: SimpleGlobal,
    private dialog: MatDialog,
    private certCuentaService: CertificacionCuentaService,
    private dataParametroService: CrmUtilService) {
    this.getServicesDAC();
    this.getServices();
  }

  getServices() {
    this.requestParameter.name = 'URLServicios';
    this.dataParametroService.postParameter(this.requestParameter)
      .subscribe(
        dataResponseParametroServidores => {
          this.sg['Servicios'] = JSON.parse(dataResponseParametroServidores.VALUE_PARAMETER);
          this.certCuentaService.GetUrlPostSaleInsp(912); //Obtener reglas para el flujo
          this.getParamTextosAplicacion();
          this.requestParameter.name = 'Servidores';
          this.dataParametroService.postParameter(this.requestParameter)
            .subscribe(data => this.responseParameter = data,
              () => { console.log('Servicio Parametros no responde'); },
              () => {
                this.sg['Servidores'] = JSON.parse(this.responseParameter.VALUE_PARAMETER);
              });
        });
  }

  getServicesDAC() {
    this.requestParameter.name = 'URLServiciosDAC';
    this.dataParametroService.postParameter(this.requestParameter)
      .subscribe(
        dataResponseParametroServidores => {
          this.sg['ServiciosDAC'] = JSON.parse(dataResponseParametroServidores.VALUE_PARAMETER);
        });
  }


  getParamTextosAplicacion() {
    this.requestParameter.name = 'paramClassFlujos';
    this.dataParametroService.postParameter(this.requestParameter)
      .subscribe(dataResponseParam => this.responseParameter = dataResponseParam,
        () => this.warningGetParamTextosAplicacion(),
        () => this.SuccesGetParamTextosAplicacion());
  }

  ngOnInit() {
    console.log('Versión aplicación: ', environment.versionApp, '11 Abril 2022');
    this.requestParameter.name = 'FLUJOS_SERVICIOS';
    this.getKnowledgeBase();
    this.dataParametroService.postParameter(this.requestParameter)
      .subscribe(dataResponseParamFlujoServicios => {
        this.sg['servicio'] = JSON.parse(dataResponseParamFlujoServicios.VALUE_PARAMETER).FLUJOS_SERVICIOS.cuentasaldia;
        this.FlujoOK = true;
      });
  }

  SuccesGetParamTextosAplicacion() {
    this.paramClassFlujos = JSON.parse(this.responseParameter.VALUE_PARAMETER);
    this.certCuentaService.SetMessages(this.paramClassFlujos);
    this.paramClassFlujos.paramClassFlujos.forEach(paramClass => {
      this.sg[paramClass.id] = paramClass.text;
    });
  }

  warningGetParamTextosAplicacion() {
    console.log('Consulta Parámetros No Exitosa: ');
  }

  /// RECIBE DATOS POR POSTMESSAGE
  getDatosPostM() {
    window.onload = () => {
      let mensaje: any;
      function reciber(e) {
        mensaje = e.data;
        if (typeof mensaje !== 'object') {
          const datosRec = mensaje.split(',');
          for (var i = 0; i < datosRec.length; i++) {
            const valor = datosRec[i].split(':');
            // Valida que el nombre sea menor a 50 caract. para evitar que guarde inf. de Base64 que también se filtra aquí
            if (valor && valor[0] && valor[0].length < 50) {
              window.sessionStorage.setItem(valor[0], valor[1]);
            }
          }
        }
      }
      window.addEventListener('message', reciber);
    };
  }

  ngOnDestroy() {
    // Elimina los datos del localStorage al destruir el componente.
    const dataName = localStorage.getItem('dataName');
    if (dataName) {
      localStorage.removeItem(dataName);
    }
  }

  /** Método que envía una petición al servicio para obtener los datos requeridos de base de conocimiento. */
  getKnowledgeBase() {
    this.certCuentaService.getKnowledegeBase(this.dataModal)
      .subscribe(resp => {
        if (resp) {
          this.sg['dataknowledgebase'] = resp[0].VALUE_KNOWLEDGE;
        }
      });
  }

  OpenEndAttentionModal(abrir: boolean) {
    const modalFin = document.getElementById('modalFin') as HTMLDialogElement;
    const dialog = document.querySelector('dialog');
    // En caso de que no sea compatible el HTMLDialog.
    if (!dialog.showModal) {
      this.dialog.open(FinalizaratencionComponent, {
        data: {
          idServicio: this.idService,
          urlReturn: this.URLReturn,
          showClose: true
        }
      });
    } else {
      if (abrir) {
        dialog.showModal();
      } else {
        dialog.close();
        if (modalFin != null) {
          modalFin.close();
        }
      }
    }
  }

}
