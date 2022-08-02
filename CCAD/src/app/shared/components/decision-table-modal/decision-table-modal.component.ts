import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RuleResponseMessage } from 'src/app/models/response-model/response-rule';
import { CertificacionCuentaService } from 'src/app/services/certicacion-cuenta.service';

@Component({
  selector: 'app-informative-modal',
  templateUrl: './decision-table-modal.component.html',
  styleUrls: ['./decision-table-modal.component.scss']
})
export class DecisionTableModalComponent {

  public listrulesFilter = [];
  public ruleDescription: string;
  public rule: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<DecisionTableModalComponent>,
    private certCuentaService: CertificacionCuentaService
  ){
    const respMessage = this.certCuentaService.GetListRules();
    this.listrulesFilter = respMessage.filter(x => x.ruleName === data);
    this.rule = this.listrulesFilter[0];
    this.ruleDescription = this.rule.ruleDescription;
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
        respMessage = this.certCuentaService.GetListRules();
        this.listrulesFilter = respMessage.filter(x => x.ruleName === item.action);
        if (this.listrulesFilter.length > 0) {
          this.rule = this.listrulesFilter[0];
          this.ruleDescription = this.rule.ruleDescription;
        }
        break;
      }
      // Ir a HTML
      case '2': {
        this.dialogRef.close();
        window.location.href = item.action;
        break;
      }

    }

  }
}
