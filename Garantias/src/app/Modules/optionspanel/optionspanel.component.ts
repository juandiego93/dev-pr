import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { InternalCase } from 'src/app/models/internalCase';
import { DataKnowledgeBase } from 'src/app/models/knowledgeBase';
import { DecisionTableModalComponent } from 'src/app/shared/decision-table-modal/decision-table-modal.component';

import { EndAttentionComponent } from '../../shared/end-attention/end-attention.component';
import { CustomService } from 'src/app/services/custom.service';


@Component({
  selector: 'app-optionspanel',
  templateUrl: './optionspanel.component.html',
  styleUrls: ['./optionspanel.component.scss']
})
export class OptionspanelComponent {

  @Input() internalCase: InternalCase;
  @Input() isStorer: boolean;


  private dataKnowledgeBase = {strNameFunctionality: 'WARRANTY48', strNameProcess: 'BEGIN', affirmative: 'ACEPTAR'} as DataKnowledgeBase;

  constructor(private dialog: MatDialog,
    private custom: CustomService,
    ) { }


  public Rules(): void {
    this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'TieneEquipo',
    });
  }

  public OpenModalEndAttention():void {
    if (this.isStorer) this.custom.EndTransactionStorer().next(true);
    else{
      const dialogRef = this.dialog.open(EndAttentionComponent, {
        disableClose: true,
        minWidth: '800px',
        data: ''
      });

      dialogRef.afterClosed().subscribe(resp => {
        // Resp = Data de retorno del modal.
      });
    }

  }
}
