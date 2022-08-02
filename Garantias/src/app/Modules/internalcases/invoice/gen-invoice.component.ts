import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Invoice } from '../../../models/invoice';
import { InvoiceModalInfo } from '../../../models/invoice';

@Component({
  selector: 'app-gen-invoice',
  templateUrl: './gen-invoice.component.html',
  styleUrls: ['./gen-invoice.component.scss']
})
export class GenInvoiceComponent implements OnInit {

  public titleModal: string;
  public invoiceForm: FormGroup

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceModalInfo,
    public dialogRef: MatDialogRef<Invoice>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.titleModal = 'Generar factura por cobro de almacenamiento'
    this.SetInvoiceForm()
  }

  private SetInvoiceForm(){
    this.invoiceForm = this.formBuilder.group({
      documentType: [{value:this.data.invoice.documentType, disabled:true}],
      documentNumber: [{value:this.data.invoice.documentNumber, disabled:true}],
      name: [{value:this.data.invoice.name, disabled:true}],
      lastName: [{value:this.data.invoice.lastName, disabled:true}],
      subject: [{value:this.data.invoice.subject, disabled:true}],
      cavName: [{value:this.data.invoice.cavName, disabled:true}],
      cavCity: [{value:this.data.invoice.cavCity, disabled:true}],
      totalToPay: [{value:this.data.invoice.totalToPay, disabled:true}]
    });
  }

  public sendInvoice(){
    this.dialogRef.close(true);
  }

}
