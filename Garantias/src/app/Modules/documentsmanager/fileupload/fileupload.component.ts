import { Guarantee } from './../../../models/guarantee';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RequestGestorDocumental } from 'src/app/models/documentalmanager';
import { Parameter } from 'src/app/models/parameter';
import { CustomService } from 'src/app/services/custom.service';
import { Util } from 'src/app/shared/util';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent implements OnInit {
  @ViewChild('valueFile') _valueFile: ElementRef;


  @Output() generateListDocument = new EventEmitter<any[]>();

  @Input() anexo1: RequestGestorDocumental;
  filesUploaded:any[];
  @Input() guarantee: Guarantee;

  public util = new Util(this.dialog);
  selectedFile: File = null;
  fileName: string = '';
  fileGestor: RequestGestorDocumental;



  @Input() styleFuera = {
    fueraInput: '',
    fueraBoton: '',
    fileUploadContainerFuera: '',
    expansionBodyFuera: ''
  };

  private parameters: Parameter;
  constructor(
    private custom: CustomService,
    private dialog: MatDialog,
  ) {
    this.custom.getGuaranteeEntity().subscribe(guaranteeRecepit => this.GetGuaranteeWithFile(guaranteeRecepit));
  }

  ngOnInit(): void {
    this.parameters = this.custom.GetParametersGroup();
    this.filesUploaded =[];
  }
  onFileSelected(event) {
    this.selectedFile = null;
    this.selectedFile = <File>event.target.files[0];
    this.fileName = this.selectedFile.name;
    this.validateNames(this.fileName);
  }

  validateNames(name: string) {
    let prueba = this.filesUploaded.find(f => f.name === name);
    let nameDocSave = this.guarantee.namesUploadedFiles.find(c => c === name);
    if (this.util.fullfilledField(prueba) || this.util.fullfilledField(nameDocSave)) {
      this.util.OpenAlert('No se puede adjuntar doble vez el mismo archivo', false);
      // this.campos.formulario.botonGuardarDoc.estado = true;
      this.fileName = '';
      this.selectedFile = null;
      this._valueFile.nativeElement.value = '';
      //this.campos.formulario.botonAdjuntarDoc.estado = false;
    } else {
      // console.log('Ahora, validar extension');
      this.validateExtension();
    }

  }
  private validateExtension(): void {
    const archivo = (<HTMLInputElement>document.getElementById('archivo')).value;
    const extension = archivo.substring(archivo.lastIndexOf('.'), archivo.length);
    if (document.getElementById('archivo').getAttribute('accept').split(',').indexOf(extension) < 0) {
      this.util.OpenAlert('Archivo inválido. No se permite la extensión ' + extension, false);
      this.fileName = '';
      this.selectedFile = null;
      this._valueFile.nativeElement.value = '';
      // this.campos.formulario.botonAdjuntarDoc.estado = false;
    } else {
      // console.log('Validación de nombre y extensión exitosa');
      // this.campos.formulario.botonAdjuntarDoc.estado = true;
    }
  }
  public onUploadFile() {
    if (this.selectedFile === null || this.selectedFile === undefined) {
      //this.campos.formulario.botonAdjuntarDoc.estado = false;
      //this.campos.formulario.botonGuardarDoc.estado = false;
      this.util.OpenAlert('Debe adjuntar un archivo para continuar el flujo', false);
      this._valueFile.nativeElement.value = '';
    } else if (this.selectedFile !== null || this.selectedFile !== undefined) {
      //this.campos.formulario.botonAdjuntarDoc.estado = true;
      // VALIDACIÓN DE LOS 2MB
      if (this.selectedFile.size > 2097152) {
        //this.campos.formulario.botonAdjuntarDoc.estado = false;
        this.util.OpenAlert('El tamaño del archivo no debe exceder los 2MB', false);
        this.fileName = '';
        this.selectedFile = null;
        this._valueFile.nativeElement.value = '';
      } else {
        this.getBase64(this.selectedFile, this.fileName).then(
          (val) => this.succesFileCode(val, this.fileName),
          (err) => this.errorFileCode(err, this.fileName),
        );
      }
    }
  }
  private succesFileCode(code: any, name: string) {
    //this.campos.formulario.botonGuardarDoc.estado = true;
    //this.campos.formulario.botonAdjuntarDoc.estado = false;
    this.fileGestor = new RequestGestorDocumental();
    this.fileGestor.name = name;
    this.fileGestor.content = code;
    this.fileGestor.content === undefined || this.fileGestor.content === null ? this.fileGestor.isValid = false : this.fileGestor.isValid = true;
    this.fileGestor.isValid === true ? this.fileGestor.src = this.parameters.IMAGE_SUCCES : this.fileGestor.src = this.parameters.IMAGE_ERROR;
    this.filesUploaded.push(this.fileGestor);
    this.fileName = '';
    this.selectedFile = null;
    this._valueFile.nativeElement.value = '';
    this.GenerateListDocuments(this.filesUploaded);

  }
  GenerateListDocuments(files: any[]) {
    this.generateListDocument.emit(files);
  }
  private errorFileCode(code: any, name: string) {
    //this.campos.formulario.botonGuardarDoc.estado = false;
    console.log('error' + code + 'en ' + name);
    this.util.OpenAlert('Error en la carga del archivo. Por favor, intente de nuevo', false);
    this.fileName = '';
    this.selectedFile = null;
    this._valueFile.nativeElement.value = '';
  }
  private getBase64(file: File, filename: string) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject('Error en la codificación a Base 64: ' + error);
    });
  }
  public onDeleteFileName(name: string) {
    let index;
    this.filesUploaded.forEach(file => {
      if (file.name === name) {
        index = this.filesUploaded.indexOf(file);
      }
    });
    if (index !== -1) {
      this.filesUploaded.splice(index, 1);
    }
    this.GenerateListDocuments(this.filesUploaded);
  }
  private GetGuaranteeWithFile(guarantee: Guarantee){
    if(guarantee !== undefined){
      this.guarantee = guarantee;
    }
  }

}
