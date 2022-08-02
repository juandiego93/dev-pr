import { InsertDdocNameRequest } from './../../../models/ddocname';
import { Guarantee } from './../../../models/guarantee';
import { FilesGD, FileUD, HeaderRequestUD, RequestBody, RequestGestorDocumental, RespUploadDoc, Document } from './../../../models/documentalmanager';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Parameter } from 'src/app/models/parameter';
import { CustomService } from 'src/app/services/custom.service';
import { ExternalService } from 'src/app/services/external.service';
import { ImeiToolsService } from 'src/app/services/imeitools.service';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Util } from 'src/app/shared/util';
import { DataTransform, WsSoapService } from 'ws-soap-lib';

@Component({
  selector: 'app-containerdocuments',
  templateUrl: './containerdocuments.component.html',
  styleUrls: ['./containerdocuments.component.scss']
})
export class ContainerdocumentsComponent implements OnInit {
  anexo: RequestGestorDocumental;
  fileGD: FilesGD;
  filesUp: FileUD[];
  filesGd: any[];
  jsonParamUploadDoc: any;
  requestBodyGD: RequestBody;

  listresponseDdocname = [];
  listddocnameRq = new Array<any>();
  loadError = 0;
  rqDdocnameItem = new InsertDdocNameRequest();
  errorMessage ='';
  outputMessage='';
  private parameters: Parameter;
  @Input() guarantee: Guarantee;
  public util = new Util(this.dialog);
  responseCMS: Document[];

  filesUploaded = [];
  x = 0;
  @Output() getGuaranteeWithDocument = new EventEmitter<Guarantee>();

  constructor(
    private custom: CustomService,
    private externaslService: ExternalService,
    private imeiTools: ImeiToolsService,
    private wsSoapService: WsSoapService,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    if (this.guarantee.namesUploadedFiles === undefined || this.guarantee.namesUploadedFiles === null)this.guarantee.namesUploadedFiles =[];
    this.parameters = this.custom.GetParametersGroup();
    this.guarantee.allowUpload = false;
  }
  public SaveUploadedFiles(){
    this.GetParamsDocumentalManager();
  }
  private GetParamsDocumentalManager(): void {

    let wsUploadDocument = this.parameters.WS_DOCUMENTS_MNG;
    this.jsonParamUploadDoc = this.parameters.MANAGE_DOCUMENTS_SERVICE;
    let xmlService = wsUploadDocument.Xml;
    const typeDoc = this.guarantee.documentTypeCode === this.parameters.GENERALS_48.PassportINS ? this.parameters.GENERALS_48.PassportUCM : this.guarantee.documentTypeCode;
    xmlService = xmlService.replace('{{tipoIdentificacion}}', typeDoc) // NE, TE y RN no los admite este WS :S
      .replace('{{numeroIdentificacion}}', this.guarantee.documentNumber)
      .replace('{{tipoDoc}}', this.jsonParamUploadDoc.xdTipoDocumental)
      .replace('{{empresa}}', this.jsonParamUploadDoc.xdEmpresa)
      .replace('{{cuenta}}', this.guarantee.account)
      .replace('{{venta}}', this.jsonParamUploadDoc.xdIdVenta)
      .replace('{{codigoCliente}}', this.jsonParamUploadDoc.xdCustomerCode)
      .replace('{{proceso}}', this.jsonParamUploadDoc.xdIdProceso);


    this.filesUp = this.filesGd;
    const error = 'Datos obligatorios no enviados o Namespace diferentes';
    this.listddocnameRq = new Array<any>();
    this.filesGd.forEach(file => {
      let dataTransform = {
        arrayData: [
          { name: 'requestDate', value: (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString()).substring(0, 19) },
          { name: 'name', value: file.name },
          { name: 'content', value: file.content }
        ]
      } as DataTransform;

      this.wsSoapService.getDataXMLTrans(xmlService, dataTransform).then(
        xml => {
          this.wsSoapService.wsSoap(wsUploadDocument.Url, xml).then(
            json => {
              try {
                console.log('Response UploadDocument: ', json);
                this.wsSoapService.getObjectByElement(json, 'tns:actionStatus').then(
                  status => {
                    if (status == 'success') {
                      this.wsSoapService.getObjectByElement(json, 'tns:document').then(
                        CMS => {
                          let response = JSON.stringify(CMS)
                            .replace(/\[\"/g, '\"')
                            .replace(/\"\]/g, '\"')
                            .replace(/tns:/g, '')
                            ;
                          this.responseCMS = JSON.parse(response);
                          console.log('Response JSON UploadDocument: ', this.responseCMS);
                          this.errorMessage = '';
                          this.listresponseDdocname = [];
                          this.loadError += 0;
                          this.outputMessage += this.responseCMS[0].field.filter(x => x.attributeName === 'dDocName')[0].attributeValue + '. Carga exitosa.';
                          this.rqDdocnameItem = new InsertDdocNameRequest();
                          this.rqDdocnameItem.DocumentNumber = this.guarantee.documentNumber;
                          this.rqDdocnameItem.DocName = this.responseCMS[0].field.filter(x => x.attributeName === 'dDocName')[0].attributeValue;
                          this.rqDdocnameItem.IdFlow = (+ this.guarantee.idFlow);
                          this.rqDdocnameItem.IdDocumentType = + this.guarantee.documentType;
                          this.listddocnameRq.push(this.imeiTools.insertDdocname(this.rqDdocnameItem));
                          this.onSuccessFileService();
                        }
                      )
                    } else {
                      this.outputMessage = '';
                      this.loadError += 1;
                      this.outputMessage += '\n' + this.loadError + '. ' + this.responseCMS[0].field.filter(x => x.attributeName === 'dDocName')[0].attributeValue + ' - ' + status;
                      this.util.OpenAlert('No se pudo adjuntar el archivo. Por favor, intente nuevamente.', false);
                    }
                  }
                )
              } catch (error) {
                this.util.OpenAlert('No se pudo consumir el ws UploadDocument. Por favor, recargue.', false);
              }
            }, error => {
              // this.util.OpenAlert( 'Error consumiendo ws UploadDocument desde la librería SOAP. Por favor, recargue.', false);
              this.custom.SetMessageError = 'Error en el servicio de cargue de documentos. ';
            }
          )
        }
      )
    });
  }


  onSuccessFileService() {
    this.x += 1;
    let outputMessage = '';
    try {
      if (this.responseCMS.length > 0) {
        this.listresponseDdocname = [];
        if (this.loadError !== 0) {
          this.errorMessage = ' Error en la carga de archivos: ' + outputMessage + '\n Intente nuevamente o notifique el fallo';
          this.util.OpenAlert(this.errorMessage, false);
          this.loadError = 0;
        } else {
          forkJoin(this.listddocnameRq).subscribe(respddoc => {
            for (const item in Object.keys(respddoc)) {
              if (respddoc.hasOwnProperty(item)) {
                this.listresponseDdocname.push(respddoc[item]);
              }
            }
            if (this.listresponseDdocname.length > 0) {
              this.listresponseDdocname.forEach(itemResponse => {
                outputMessage = 'Error en el registro del ddocname. Por favor, intente nuevamente. ';
                if (!itemResponse.isValid) {
                  this.loadError += 1;
                  outputMessage += ' - ' + itemResponse.message;
                }
              });
            } else {
              this.loadError += 1;
              outputMessage = 'Error. No se inserto campo ddocname de gestor documental. Por favor, intente nuevamente.';
            }
            if (this.loadError === 0) {
              console.log('Subida exitosa ' + this.responseCMS);
              this.SaveStepFilesLoaded();
            } else {
              this.errorMessage = outputMessage;
              this.util.OpenAlert(this.errorMessage, false);
              this.loadError = 0;
            }
          }, error => {
            this.errorMessage += 'Error en el servicio de carga de gestor documental.' + error.message + 'Por favor, intente nuevamente.';
            this.util.OpenAlert(this.errorMessage, false);
          });
        }
        this.requestBodyGD = {} as RequestBody;
        this.filesUploaded = [];
      } else {
        console.log('Archivos error: ', this.requestBodyGD.files);
        console.log('Carga fallida de archivos en ', this.responseCMS);
        this.errorMessage = 'Error en la carga de archivos. Por favor, intente nuevamente o notifique el fallo.';
        this.util.OpenAlert(this.errorMessage, false);
        this.requestBodyGD = {} as RequestBody;
        this.filesUploaded = [];
      }
    } catch (error) {
      console.log('Archivos error: ', this.requestBodyGD.files);
      console.log('Carga fallida de archivos en ', this.responseCMS, 'error: ', error);
      this.errorMessage = 'Error en la carga de archivos: ' + this.responseCMS + '. Por favor, intente nuevamente o notifique el fallo.';
      this.util.OpenAlert(this.errorMessage, false);
      this.requestBodyGD = {} as RequestBody;
      this.filesUploaded = [];
    }
  }
  private SaveStepFilesLoaded():void{
    this.guarantee.allowUpload = false;
    if(this.util.fullfilledField(this.guarantee.namesUploadedFiles)){
      this.guarantee.namesUploadedFiles = [];
    }
    if(this.util.fullfilledField(this.filesUp) && this.filesUp.length >0){
      this.filesUp.forEach(file=>{
        this.guarantee.namesUploadedFiles.push(file.name);
      });
      this.custom.getGuaranteeEntity().next(this.guarantee);
      this.GenerateGuaranteeWithDocuments(this.guarantee);
    }

  }
  GenerateGuaranteeWithDocuments(newGuarantee: Guarantee) {
    this.getGuaranteeWithDocument.emit(newGuarantee);
  }

  OnGenerateListDocument(files: any[]) {
    console.log('Archivos: ' + files);
    if (files.length > 0) {
      const listFiles = [];
      files.forEach(individualFile => {
        this.fileGD = new FilesGD();
        this.fileGD.name = individualFile.name;
        this.fileGD.content = individualFile.content;
        listFiles.push(this.fileGD);
        this.guarantee.allowUpload = true;
      });
      this.filesGd = listFiles;
      console.log('Lista: ', listFiles);
    } else {
      this.guarantee.allowUpload = false;
    }
  }


}
