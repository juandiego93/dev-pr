import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ResponseParameter } from '../../models/response-model/ResponseParameter';
import { DataParameterHeader } from '../../models/DataParameterHeader';
import { RequestParameter } from '../../models/requests-models/resquestParameter';
import { CrmUtilService } from '../../services/CrmUtil.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SimpleGlobal } from 'ng2-simple-global';
import { Category, ResponseCTypification, ResponseMessages, Subcategory, CustomerVoice, TypeOfCase, ClosingCode } from 'src/app/models/response-model/ResponseCTypification';
import { RequestPresencialBizInteraction, HeaderRequestBizInteraction } from '../../models/requests-models/RequestPresencialBizInteraction';
import { RequestCloseTransaction } from '../../models/requests-models/RequestCloseTransaction';
import { BizInteractionService } from '../../services/bizInteractionService';
import { RequestCaseTypification } from '../../models/requests-models/RequestCaseTypification';
import { CertificacionCuentaService } from 'src/app/services/certicacion-cuenta.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ResponseGetBizInteraction } from 'src/app/models/response-model/responseGetBizInteraction';
import { DomSanitizerPipe } from 'src/app/shared/pipes/dom-sanitizer.pipe';
import { delay, tap } from 'rxjs/operators';
import { RequestsEndAttention } from '../../models/requests-models/requestEndAttention';

declare var $: any

@Component({
  selector: 'app-finalizaratencion',
  templateUrl: './finalizar-atencion.component.html',
  styleUrls: ['./finalizar-atencion.component.css']
})
export class FinalizaratencionComponent implements OnInit {

  @Input() idServicio:string;
  @Input() URLReturn:string;

   idTurn: string;
   idService: string;

  formFinalAten: FormGroup;

  responseParameter: ResponseParameter;
  requestParameter = new RequestParameter();

  datosTurno: { 'AP_CR_TURNOS' };
  dataParameterHeader: DataParameterHeader;
  requestPresencialBiz = new RequestPresencialBizInteraction();
  requestCloseTransaction= new RequestCloseTransaction();

  requestCT = new RequestCaseTypification();
  request = new RequestPresencialBizInteraction();
  responseCTypification: ResponseCTypification;
  responseMessages: ResponseMessages;
  RespCategory: Category;
  RespSubcategory: Subcategory;
  RespCustomerVoice: CustomerVoice;
  listCat = new Array<Category>();
  listSubC = new Array<Subcategory>();
  listCusVoi = new Array<CustomerVoice>();
  listCloCode = new Array<ClosingCode>();

  categoria = '';
  subcategoria = '';
  vozCliente = '';
  codCierre = '';
  comentarios = '';

  tipoDocumento: string;
  numeroDocumento: string;
  idBusinessInteraction: string;
  biHeaderId: string;
  tcanal: number;
  canal: string;
  //URLReturn: string;
  mensajePopup:string;
  mensajeValidacion: string;
  respBi: ResponseGetBizInteraction;
  showEnd = false;
  LoadComplete = false;
  dataHTML: string;

  public idFlow: string;
  public documentType: string;
  public documentNumber: string;
  public idUser: string;
  public Min: string;
  public urlReturn: string;
  public showCase: string;
  public Name: string;
  public lastName: string;
  public MailForResponse: string;
  public redirectOutFrame: string;
  public idBI: string;
  public URL: string;
  public GUID: string;
  public context: string;
  public enviroment: string;
  public account: string;
  public channelTypeCode: string;

  constructor(@Inject(MAT_DIALOG_DATA) public datos,
              private router: Router,
              private route_: ActivatedRoute,
              private formBuilder: FormBuilder,
              private dataParametroService: CrmUtilService,
              private sg: SimpleGlobal,
              private dialog: MatDialog,
              private domSanitizerPipe: DomSanitizerPipe,
              private bizInteractionService: BizInteractionService,
              private certCuentaService: CertificacionCuentaService)
  {

    this.route_.queryParams.subscribe(params => {
      this.tipoDocumento = params['DocumentType'];
      this.numeroDocumento = params['DocumentNumber'];
      this.idBusinessInteraction = params['idBusinessInteraction'];
      this.idTurn = params['idTurn'];
      this.biHeaderId = params['idHeader'];
      this.tcanal = params['channelTypeCode'];
      this.canal = params['channelCode'];
      this.URLReturn = params['URLReturn'];
    });

    let data: any;
    data = sessionStorage.getItem('documentType');
    if (data != undefined) {
      this.tipoDocumento = data;
    }
    data = sessionStorage.getItem('documentNumber');
    if (data != undefined) {
      this.numeroDocumento = data;
    }

    data = sessionStorage.getItem('idTurn');
    if (data != undefined) {
      this.idTurn = data;
    }

    data = sessionStorage.getItem('idHeader');
    if (data != undefined) {
      this.biHeaderId = data;
    }

    data = sessionStorage.getItem('channelTypeCode');
    if (data != undefined) {
      this.tcanal = data;
    }

    data = sessionStorage.getItem('URLReturn');
    if (data != undefined) {
      this.URLReturn = data;
    }


    var formData = new FormData();
    formData = this.sg['postCloseAttentionData'];

    this.bizInteractionService.postCloseAttention(formData)
    .pipe(
      tap(datosBridge => this.setModalForm(datosBridge)),
      delay(200)
    ).subscribe(() => {$('#myfrm').submit(); this.LoadComplete = true});
  }

  private setModalForm(requestForm: RequestsEndAttention) {
    this.idFlow = requestForm.idFlow
    this.documentType = requestForm.documentType
    this.documentNumber = requestForm.documentNumber
    this.idTurn = requestForm.idTurn
    this.idUser = requestForm.idUser
    this.Min = requestForm.Min
    this.urlReturn = requestForm.urlReturn
    this.showCase = requestForm.showCase
    this.Name = requestForm.Name
    this.lastName = requestForm.lastName
    this.MailForResponse = requestForm.MailForResponse
    this.redirectOutFrame = requestForm.redirectOutFrame
    this.biHeaderId = requestForm.biHeaderId
    this.idBI = requestForm.idBI,
    this.URL = requestForm.URL
    this.GUID = requestForm.GUID
    this.context = requestForm.context
    this.enviroment = requestForm.enviroment
    this.account = requestForm.account
    this.channelTypeCode = requestForm.channelTypeCode
  }

  ngOnInit(): void {
    this.formFinalAten = this.formBuilder.group({
      categoria: [''],
      subCategoria: [''],
      vozCliente: [''],
      codCierre: [''],
      procedencia: [''],
      comentarios: [''],
    });
    this.idService = this.idService || this.datos.idServicio;
    this.URLReturn = this.URLReturn || this.datos.urlReturn;
    if (this.sg['Servicios'] !== undefined) {
      //this.caseTypification();
    } else {
      //this.getServices();
    }
    }
  // Método que consume el servicio caseTypification
  caseTypification() {
    const requestCaseTyp: RequestCaseTypification = {
      headerRequest: {
        idBusinessTransaction : '234321',
        idApplication: '54321234',
        target : '',
        channel : 'USSD',
        startDate : this.buildDate(),
      },
      service: this.sg['servicio']
    };
    this.certCuentaService.getcaseTypification(requestCaseTyp)
    .subscribe(
      datos => this.responseCTypification = datos,
      () => this.ConsultaCTypificationError(),
      () => this.ConsultaCTypificationSuccessful()
    );
  }

  getServices() {
    this.requestParameter.name = 'URLServicios';
    this.dataParametroService.postParameter(this.requestParameter)
      .subscribe(
        dataResponseParametroServidores => {
          this.sg['Servicios'] = JSON.parse(dataResponseParametroServidores.VALUE_PARAMETER);
          this.requestParameter.name = 'Servidores';
          this.dataParametroService.postParameter(this.requestParameter)
            .subscribe(data => this.responseParameter = data,
              () => { console.log('Servicio Parametros no responde'); },
              () => {
                this.sg['Servidores'] = JSON.parse(this.responseParameter.VALUE_PARAMETER);
                this.caseTypification();
              });
        });
  }

  // Método que llena las listas de categoria, subcategoria y customer voz con respuesta del servicio.
  ConsultaCTypificationSuccessful() {
    if (this.responseCTypification.isValid == true) {
      console.log("Consumo servicio cTypification ok");
      this.responseMessages = JSON.parse(this.responseCTypification.message);

      this.responseMessages.category.forEach(Cat => {
      this.RespCategory = new Category();
      this.RespCategory.code = Cat.code;
      this.RespCategory.name = Cat.name;
      this.RespCategory.subcategory = Cat.subcategory;
      this.listCat.push(Cat);
      });
      this.getCategoria();
      this.getSubcategoria();
      this.getCustVoice();
      this.getCodCierre();
      this.getComment();
    }
  }
  // Método que informa falla del consumo
  ConsultaCTypificationError() {
    console.log("Error al consumir el Servicio. CT");
    console.log(this.responseCTypification);
    this.responseMessages = JSON.parse(this.responseCTypification.message);
    console.log(this.responseMessages);
  }
  // Método que llena las listas de categoria con respuesta del servicio.
  getCategoria() {
    this.formFinalAten.get('categoria').valueChanges
    .subscribe(code => {
      this.categoria = code;
      this.listSubC = this.listCat.find(subC => subC.code == code).subcategory;
    });
  }

  // Método que llena las listas de subcategoria con respuesta del servicio.
  getSubcategoria() {
    this.formFinalAten.get('subCategoria').valueChanges
    .subscribe(code => {
      this.subcategoria = code;
      this.listCusVoi = this.listSubC.find(CsV => CsV.code == code).customerVoice;
    });
  }

  // Método que llena las listas de customer voz con respuesta del servicio.
  getCustVoice() {
    this.formFinalAten.get('vozCliente').valueChanges
    .subscribe(code => {
      this.vozCliente = code;
      this.listCloCode = this.listCusVoi.find(ClCd => ClCd.code == code).ClosingCode;
    });
  }

  // Método que llena las listas de customer voz con respuesta del servicio.
  getCodCierre() {
    this.formFinalAten.get('codCierre').valueChanges
    .subscribe(code => {
      this.codCierre = code;
    });
  }

  getComment() {
    this.formFinalAten.get('comentarios').valueChanges
    .subscribe(comment => {
      this.comentarios = comment;
    });
  }

  // Método consume parametros para recibir datos del turno.
  consultaParm_Cierre() {
    this.abrirModal(false);
    const header = JSON.parse(this.responseParameter.VALUE_PARAMETER);
    this.dataParameterHeader = header;
    this.requestParameter.name = 'AP_CR_TURNOS';
    this.dataParametroService
      .postParameter(this.requestParameter)
      .subscribe(
        data => this.responseParameter = data,
        () => this.consultaParmError(),
        () => this.consumirNotificarEvento()
      );
  }
  // Método consume servicio inicio de atención (BizPresencialInteraction)
  consumirNotificarEvento() {
    this.datosTurno = JSON.parse(this.responseParameter.VALUE_PARAMETER);

    // REQUEST PARA cierre DE TURNO
    if (this.idTurn !== undefined && this.idTurn !== null && this.idTurn !== '' && this.idTurn !== '0') {
      this.request.idEvent = this.datosTurno.AP_CR_TURNOS.cierre;
      this.requestPresencialBiz.presencialChannel = true;
      this.request.idTurn = this.idTurn;
    } else {
      this.requestPresencialBiz.presencialChannel = false;
    }

    // REQUEST PARA APERTURA DE TURNO
    this.requestPresencialBiz.idEvent = this.datosTurno.AP_CR_TURNOS.cierre;
    this.requestPresencialBiz.customerCode = this.numeroDocumento;
    this.requestPresencialBiz.biHeaderId = this.biHeaderId;
    this.requestPresencialBiz.channelTypeCode = this.tcanal;
    this.requestPresencialBiz.executionDate = this.buildDate();
    this.requestPresencialBiz.interactionDirectionTypeCode = '0'; // En el request de ejemplo valor creo en string

    // DATOS DEL FORMULARIOS //
    this.requestPresencialBiz.categoryCode = parseInt(this.categoria);
    this.requestPresencialBiz.subCategoryCode = parseInt(this.subcategoria);
    this.requestPresencialBiz.voiceOfCustomerCode = parseInt(this.vozCliente);
    this.requestPresencialBiz.closeInteractionCode = parseInt(this.codCierre);
    this.requestPresencialBiz.description = this.comentarios;

    // PARAMETROS DE ENCABEZADO NECESARIOS PARA EL SERVICIO
    this.requestPresencialBiz.headerRequestBizInteraction = new HeaderRequestBizInteraction();
    this.requestPresencialBiz.headerRequestBizInteraction.transactionId = this.dataParameterHeader.string;
    this.requestPresencialBiz.headerRequestBizInteraction.system = this.dataParameterHeader.string;
    this.requestPresencialBiz.headerRequestBizInteraction.user = this.dataParameterHeader.string;
    this.requestPresencialBiz.headerRequestBizInteraction.password = this.dataParameterHeader.string;
    this.requestPresencialBiz.headerRequestBizInteraction.requestDate = this.buildDate();
    this.requestPresencialBiz.headerRequestBizInteraction.ipApplication = this.dataParameterHeader.string;
    this.requestPresencialBiz.headerRequestBizInteraction.traceabilityId = this.dataParameterHeader.string;
    this.bizInteractionService.setPresencialBizInteraction(this.requestPresencialBiz).subscribe( respBI => this.respBi = respBI,
      () => this.errorBI(),
      () => this.successBI());
  }
  successBI() {
    console.log('BI exitoso: ' + this.respBi.message);
    // FINALIZAMOS LA ATENCION
    this.requestCloseTransaction.guidTransaction = this.sg['guid'];
    this.requestCloseTransaction.state = 'finalizar';
    this.dataParametroService.postCloseTransaction(this.requestCloseTransaction)
      .subscribe(datos => {
          this.Redireccionamiento360();
        }, error => console.log(error.message)
      );
  }

  errorBI() {
    console.log('Error en BI');
  }
  // Método que crea formato de la fecha para header startDate.
  buildDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hour = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const strDate = year + '-' + month + '-' + day + 'T' + hour + ':' + minutes + ':' + '00';
    return strDate;
  }
  // Método que reportaa falla del servicio de parametros.
  consultaParmError() {

    console.log('Error al consumir service parámetro');
    window.location.reload();
    this.router.navigate(['/view360']);
  }
  // Método que abre modal que finalizar atencion.
  abrirModal(abrir: boolean) {
    const modalFin = document.getElementById('modalFin') as HTMLDialogElement;
    const dialog = document.querySelector('dialog');

    if (!dialog.showModal) {
      // dialogPolyfill.registerDialog(dialog); // Corregir para abrir con modal nativo de AngularMaterial. Ejemplo en CertificadoCuentaComponent
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

  // Método consume parametros para recibir header y envia a método de consumo de cierre de atención.
  onSubmit() {
    if (this.categoria !== ''
        && this.subcategoria !== ''
        && this.vozCliente !== ''
        && this.codCierre !== ''
        && this.comentarios !== '') {
          this.requestParameter.name = 'HEADER_QUERY_BYIMEI';
          this.dataParametroService
          .postParameter(this.requestParameter)
          .subscribe(
            data => this.responseParameter = data,
            () => this.consultaParmError(),
            () => this.consultaParm_Cierre()
            );
          } else{
            this.mensajeValidacion = 'Seleccione categoría, subcategoría, voz de cliente, código de cierre y comentarios.';
          }
    }

  Redireccionamiento360() {
    const retorno: string =  decodeURIComponent(sessionStorage.getItem('urlReturn'));

    // Borra los registros pudieron ser creados en el LocalStorage
    const dataName = localStorage.getItem('dataName');
    if (dataName) {
      localStorage.removeItem(dataName);
      localStorage.removeItem('dataName');
    }

    if (retorno !== undefined) {
      window.top.location.replace(retorno);
      } else {
        window.location.reload();
      }
  }

  // Método que cierra modal que finalizar atencion.
  closeDialog() {
    this.dialog.closeAll();
  }

}
