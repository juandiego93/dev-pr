import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { InterceptorService } from 'src/app/interceptors/interceptor.service';
import { TokenInterceptorService } from 'src/app/interceptors/token-interceptor.service';


export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
];
