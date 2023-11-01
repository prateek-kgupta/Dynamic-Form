import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfo } from '../services/user-info.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private user: UserInfo) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    let excludeHeader = false;
    const backendUrl = 'http://localhost:3000'
    const token = this.user.token

    // REQUESTS TO BE EXCLUDED
    if (request.url.includes('/user/')) {
      excludeHeader = true;
      if (request.url.includes('/user/getUser/')) {
        excludeHeader = false;
      }
    }
    else if(request.url===backendUrl+'/form'){
      excludeHeader = true
    }

    // SENDING REQUEST
    if (excludeHeader) {
      return next.handle(request);
    }
    else{
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
      return next.handle(authRequest)
    }
  }
}
