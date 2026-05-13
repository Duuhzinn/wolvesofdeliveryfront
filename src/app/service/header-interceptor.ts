import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Injectable, NgModule } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    console.log('TOKEN LOCALSTORAGE:', token);
    console.log('URL:', req.url);

    if (token) {

      const tokenRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('AUTH HEADER:', tokenRequest.headers.get('Authorization'));

      return next.handle(tokenRequest);

    }

    return next.handle(req);
  }
}

@NgModule({
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: HeaderInterceptor,
    multi: true,
  }],
})

export class HttpInterceptorModule {}