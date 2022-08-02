import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemSC, RequestDeleteSC,SubmitRequestSC,DesactiveItemSCRequest } from './../../models/shopping-cart.interface';
import { ExternalService } from '../../services/external.service';
import { Util } from 'src/app/shared/util';
import { Parameter } from './../../models/parameter';
import { CustomService } from '../../services/custom.service';

@Component({
  selector: 'app-shoppingcartitemcls',
  templateUrl: './shoppingcart.component.html',
  styleUrls: ['./shoppingcart.component.scss']
})
export class ShoppingcartitemclsComponent {

  public displayedColumns: string[] = ['itemParentId', 'poIdMain', 'items', 'select'];
  public listItems: ItemSC[];
  public scId : string;
  private cancellSCRequest: RequestDeleteSC;
  private submitRequest: SubmitRequestSC;
  private util = new Util(this.dialog);
  private parameters: Parameter;
  private desactiveItemSCRequest:DesactiveItemSCRequest

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private externaslService: ExternalService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ShoppingcartitemclsComponent>,
    private custom: CustomService) {
    this.scId = data.scID;
    this.listItems = data.items;
  }

  public DeleteItem(item: ItemSC){
    this.desactiveItemSCRequest = {
      scID: this.scId,
      itemID: item.itemParentId
    }

    this.cancellSCRequest = {
      scID: this.scId,
      subType : 'equipment',
      itemID: item.itemParentId,
      returnPrices : true
    }

    this.submitRequest = {
      scID: this.scId,
      isLegacy:true
    }

    const parameter = this.custom.GetParametersGroup();

    this.externaslService.DesactiveItemSC(this.desactiveItemSCRequest).subscribe(respDesactiveItem => {
      if(respDesactiveItem.ok){
        this.externaslService.DeleteItemSC(this.cancellSCRequest).subscribe(respDelete=>{
          if(respDelete.ok){
            const dialogMsg = this.util.getMessageModal(parameter.WARRANTY_MESSAGES.DeleteItemOk);
            dialogMsg.afterClosed().subscribe(() => {
              this.externaslService.SubmitItemSC(this.scId,this.submitRequest).subscribe(respSC =>{
                if(respSC.ok){
                  const dialogMsg = this.util.getMessageModal(parameter.WARRANTY_MESSAGES.OrderGeneration + " " + this.scId);              
                  dialogMsg.afterClosed().subscribe(() => {
                    this.dialogRef.close(undefined);
                  });  
                }else{
                  this.util.OpenAlert('No se pudo generar la orden de compra', false);
                }
              }, (error)=>{
                this.util.OpenAlert('Error Al generar la orden de compra ' + error, false);
              });
            });
          } else{
            this.util.OpenAlert('No se pudo eliminar Item', false);
          }
        }, (error)=>{
           this.util.OpenAlert('Error al eliminar item del carrito de compras' + error, false);
        });
      } else {
        this.util.OpenAlert('No se pudo desactivar el item', false);
      }
    }, (error)=>{
        this.util.OpenAlert('Error al desactivar Item: ' + error, false);
    });
  }
}
