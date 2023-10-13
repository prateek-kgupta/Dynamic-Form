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

  constructor(private router: Router, private user: UserInfo) {

    router.events.subscribe((event: Event) => {
      if(event instanceof NavigationEnd){
        this.currentRoute = event.url
        this.user.routeInfo = this.currentRoute
      }
    })


  }
}