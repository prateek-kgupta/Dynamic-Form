import { Component } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { UserInfo } from './services/user-info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  currentRoute: string = '';
  showNav: boolean = true;

  constructor(private router: Router, private user: UserInfo) {
    router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        if (this.currentRoute === '/login') {
          this.showNav = false;
        } else if (this.currentRoute.startsWith('/login?')) {
          this.showNav = false;
        } else {
          this.showNav = true;
        }
        this.user.routeInfo = this.currentRoute;
        // console.log("In the app: ",this.currentRoute)
        // console.log("User service", this.user.routeInfo)
      }
    });
  }
}
