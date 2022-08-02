import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { NgxSpinnerService } from 'ngx-spinner';

import { ExternalService } from '../services/external.service';
import { CustomService } from '../services/custom.service';


@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(
    private readonly sessionService: ExternalService, private custom: CustomService, private loadingService: NgxSpinnerService
  ) { }

  private _refreshSubject: Subject<any> = new Subject<any>();

  private _ifTokenExpired() {
    this._refreshSubject.subscribe({
      complete: () => {
        this._refreshSubject = new Subject<any>();
      }
    });
    if (this._refreshSubject.observers.length === 1) {
      // this.sessionService.GetToken().subscribe(this._refreshSubject);
    }
    return this._refreshSubject;
  }

  private _checkTokenExpiryErr(error: HttpErrorResponse): boolean {
    return (error.status &&  error.status === 401);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.endsWith("/logout") || req.url.endsWith("/token-refresh")) {
      return next.handle(req);
    } else {
      return next.handle(req).pipe(
        catchError((error, caught) => {
          if (error instanceof HttpErrorResponse) {
            if (this._checkTokenExpiryErr(error)) {
              return this._ifTokenExpired().pipe(
                switchMap(() => {
                  return next.handle(this.updateHeader(req));
                })
              );
            } else {
              return throwError(error);
            }
          }
          return caught;
        })
      );
    }
  }

  updateHeader(req) {
    this.custom.DelCount();
    const parameter = this.custom.GetParametersGroup();
    parameter.TOKEN_CASES.Token
    req = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${parameter.TOKEN_CASES.Token}`)
    });
    return req;
  }
}
