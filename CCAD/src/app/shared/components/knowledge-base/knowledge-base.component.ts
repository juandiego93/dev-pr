import { Component, OnInit, Inject } from '@angular/core';
import { CertificacionCuentaService } from 'src/app/services/certicacion-cuenta.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestKnowledgeBase } from 'src/app/models/requests-models/requestKnowledgeBase';

@Component({
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styles: []
})
export class KnowledgeBaseComponent implements OnInit {

  knowledgeBase = '';

  constructor(@Inject(MAT_DIALOG_DATA) private data: RequestKnowledgeBase,
              private certCuentaService: CertificacionCuentaService) { }

  ngOnInit(): void {
    this.getKnowledgeBase();
  }

  /** Método que envía una petición al servicio para obtener los datos requeridos de base de conocimiento. */
  getKnowledgeBase() {
    this.certCuentaService.getKnowledegeBase(this.data)
      .subscribe(resp => {
        if (resp) {
          this.knowledgeBase = resp[0].VALUE_KNOWLEDGE;
        }
      });
  }

}
