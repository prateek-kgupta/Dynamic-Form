import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanDeactivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UserInfo } from './user-info.service';

@Injectable()
export class RouteGuardService implements CanActivate {
  constructor(private user: UserInfo, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    console.log(route, state)
    let loginPage = false
    if(state.url === '/login'){
      loginPage = true
    }
    else if(state.url.startsWith('/login?')){
      loginPage = true
    }
    else{
      loginPage = false
    }


    if (loginPage && this.user.loggedIn) {
      return this.router.createUrlTree(['/']);
    } else if (loginPage && !this.user.loggedIn) {
      return true;
    } else if (this.user.loggedIn) {
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
