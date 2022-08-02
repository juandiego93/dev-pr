import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({ providedIn: 'root' })
export class InterceptorService implements HttpInterceptor {

  requestCount = 0;

  constructor(private loadingService: NgxSpinnerService) { }

 intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   this.requestCount++;
   this.loadingService.show();

   return next.handle(req)
      .pipe(
        finalize(() => {
          this.requestCount--;
          if (this.requestCount === 0) {
            this.loadingService.hide();
          }
        }));
  }
}
