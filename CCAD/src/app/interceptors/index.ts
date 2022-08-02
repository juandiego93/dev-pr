import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from './interceptor.service';
import { TraceabilityLogInterceptor } from './traceabilitylog.interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: TraceabilityLogInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
];
