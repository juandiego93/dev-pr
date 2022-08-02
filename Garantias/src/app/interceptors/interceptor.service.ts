import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap, retry } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from './../../environments/environment';

import { CustomService } from '../services/custom.service';
import { ErrorModel } from '../models/errorModel';


@Injectable({ providedIn: 'root' })
export class InterceptorService implements HttpInterceptor {

  constructor(private loadingService: NgxSpinnerService,
  private custom: CustomService) { }

 intercept(req: any, next: HttpHandler): Observable<HttpEvent<any>> {
   this.custom.AddCount();
   this.loadingService.show();

   const errorObj = new ErrorModel();

   return next.handle(req)
      .pipe(retry(3),
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            errorObj.code = event.status;
            errorObj.redirecTo = environment.urlRedirectTo;
            errorObj.responseText = '';
          }
        },
        // Operation failed; error is an HttpErrorResponse
        error => (errorObj.responseText = error.message,
          errorObj.error = error?.error,
          errorObj.code = error?.status,
          errorObj.serviceName =
          error.url.split('/')[4].split('?')[0] === 'api'
          ? error.url.split('/')[3].split('?')[0]
          : error.url.split('/')[4].split('?')[0],
          errorObj.serviceResponse = error?.error?.Message,
          errorObj.redirecTo = environment.urlRedirectTo
        )
      ),
        finalize(() => {
          if (errorObj.code === 0 || errorObj.code >= 300) {
            if (errorObj.code === 400 && (this.custom.GetCountError() > 0 &&this.custom.GetCountError() <= environment.ic)) { //Máximo intentos fallidos por badRequest
              console.log('Ejecuta nuevamente', req.url);
            } else {
              this.custom.GetInterceptedSource().next(errorObj);
            }
        }
          this.custom.DelCount();
          if (this.custom.GetCount() === 0) {
            this.loadingService.hide();
          }
        }));
  }
}
