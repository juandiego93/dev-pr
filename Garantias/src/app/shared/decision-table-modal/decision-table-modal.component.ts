import { CustomService } from 'src/app/services/custom.service';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RuleResponseMessage } from './../../models/rule';
import { WarrantyService } from 'src/app/services/warranty.service';
import { Util } from './../util';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-informative-modal',
  templateUrl: './decision-table-modal.component.html',
  styleUrls: ['./decision-table-modal.component.scss']
})
export class DecisionTableModalComponent {

  public listrules = [];
  public listrulesFilter = [];
  public ruleDescription: string;
  public rule: any;
  public show = false;
  public disableNo = false;

  private respMessage: RuleResponseMessage[];
  private dataIn;
  private dataValue;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<DecisionTableModalComponent>,
    private warrantyService: WarrantyService,
    private util: Util,
    private custom: CustomService,
  )
  { 
    // this.dataIn = data;
    this.GetTypeDataIn(data);
    this.GetRules();
  }

  private GetTypeDataIn(entry): void{
    console.log('info data entry', entry);
    if(typeof entry === 'object'){
      this.dataIn = entry.data;
      this.dataValue = entry.value;
    }else{
      this.dataIn = entry;
    }
  }

  private GetRules(): void{
    this.respMessage = this.warrantyService.GetListRules();
    if (!this.respMessage) {
      this.warrantyService.GetRulesWarranty48(Number(148)).subscribe((r) => {
        if(r === false){
          this.custom.AddCountError();
          if(this.custom.GetCountError() <= environment.ic){
            this.GetRules(); //Vuelve a consumir el ws para que haya respuesta
          }
        } else{
          this.custom.DelCountError();
          this.respMessage = r;
          this.ShowRules();
        }
      });
    } else{
      this.ShowRules();
    }
  }

  private ShowRules(): void {
      this.listrulesFilter = this.respMessage.filter(x => x.ruleName === this.dataIn);
      if (this.listrulesFilter.length > 0) {
        this.rule = this.listrulesFilter[0];
        this.ruleDescription = this.rule.ruleDescription;
        this.disableNo = this.dataIn === 'ConformeSolucion'
        switch (this.dataIn) {
          case 'ContinuarSuscripcion':
            this.ruleDescription = this.util.StringFormat(this.ruleDescription, sessionStorage.getItem('min'))
            break;
          case 'CSTIncumplio':
            this.ruleDescription = this.util.StringFormat(this.ruleDescription, this.warrantyService.getBreachTimeDays.toString())
            break;
          case 'DevuelveAccesorios':
            this.ruleDescription = this.util.StringFormat(this.ruleDescription, this.dataValue)
            break;
          default:
            break;
        }
      }
      this.show = true;
  }

  public SelectButton(item): void {
    switch (item.functionality) {
      // Programacion Interna
      case '0': {
        this.dialogRef.close({...item, ruleName: this.rule.ruleName});
        break;
      }
      // Nueva Regla
      case '1': {
        let respMessage: RuleResponseMessage[];
        respMessage = this.warrantyService.GetListRules();
        this.listrulesFilter = respMessage.filter(x => x.ruleName === item.action);
        if (this.listrulesFilter.length > 0) {
          this.rule = this.listrulesFilter[0];
          this.rule.ruleDescription = this.rule.ruleName === 'IMEICorresponde' ?
          this.util.StringFormat(this.rule.ruleDescription, this.custom.getImei) : this.rule.ruleDescription;
          this.ruleDescription = this.rule.ruleDescription;
        }
        break;
      }
      // Ir a HTML
      case '2': {
        this.dialogRef.close(true);
        window.location.href = item.action;
        break;
      }
    }
  }
}
