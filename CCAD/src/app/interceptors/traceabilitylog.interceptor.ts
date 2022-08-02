import { Injectable } from "@angular/core";
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { RequestTraceabilityLog } from 'src/app/models/requests-models/requesttraceabilitylog';
import { SimpleGlobal } from 'ng2-simple-global';


import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpResponse
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap, finalize } from "rxjs/operators";


@Injectable()
export class TraceabilityLogInterceptor implements HttpInterceptor {
  constructor(private dataCrmUtil: CrmUtilService, private sg: SimpleGlobal) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    let estadoRespuesta: string;
    let mensajeError: string;
    let respuestaRetornada: string;
    let requestTraceabilityLog = new RequestTraceabilityLog();

    return next.handle(req).pipe(
      tap(
        // Succeeds when there is a response; ignore other events
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            estadoRespuesta = 'OK';
            respuestaRetornada = event.body;
          }
        },
        // Operation failed; error is an HttpErrorResponse
        error => (mensajeError = error.message, estadoRespuesta = 'OK')
      ),
      // Log when response observable either completes or errors
      finalize(() => {

        if (req.url.indexOf('TraceabilityLog') == -1) {

          // ENVIAMOS EL REGISTRO DEL REQUEST
          requestTraceabilityLog.service = req.url;
          requestTraceabilityLog.method = req.method;
          requestTraceabilityLog.guid = this.sg['guid'];
          requestTraceabilityLog.typed = 'IN';
          let resreq = JSON.stringify(req.body);
          requestTraceabilityLog.data = resreq.replace(/"/g, "'");
          this.dataCrmUtil.saveTraceability(requestTraceabilityLog);

          // ENVIAMOS REGISTRO DEL RESPONSE

          requestTraceabilityLog.service = req.url;
          requestTraceabilityLog.method = req.method;
          requestTraceabilityLog.guid = this.sg['guid'];
          requestTraceabilityLog.typed = 'OUT';
          if (estadoRespuesta == 'OK') {
            let resSTR = JSON.stringify(respuestaRetornada)
            requestTraceabilityLog.data = resSTR.replace(/"/g, "'");
          }
          else {
            requestTraceabilityLog.data = mensajeError;
            console.log('Data response Error: ' + mensajeError);
          }
          this.dataCrmUtil.saveTraceability(requestTraceabilityLog);
        }
      })
    );
  }
}
