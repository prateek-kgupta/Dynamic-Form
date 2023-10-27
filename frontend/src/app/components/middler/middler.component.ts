import { Component } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-middler',
  templateUrl: './middler.component.html',
  styleUrls: ['./middler.component.css'],
})
export class MiddlerComponent {
  currentRoute: string = '';
  eventSubscripiton: Subscription;
  token: string = '';

  constructor(
    private user: UserInfo,
    private cookieService: CookieService,
    private router: Router,
    private socket: SocketService
  ) {
    this.eventSubscripiton = router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;

        console.log(1);
      }
    });
  }

  ngOnInit() {
    console.log(2);
    this.token = this.currentRoute.split('/').splice(-1)[0];
    // console.log(this.token);
    this.cookieService.set('token', this.token, 1, '/');
    console.log("Token from cookie", this.cookieService.get('token'))
    this.router.navigate(['/']);
    console.log("Just after navigating")
  }

  ngOnDestroy() {
    if (this.eventSubscripiton) {
      this.eventSubscripiton.unsubscribe();
    }
   
    console.log(3, this.cookieService.get('token'));
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    // Connect to websocket
    this.socket.connect(payload._id)
    this.user.token = this.token;
    this.user.loggedIn = true;
    this.user['_id'] = payload._id;
    this.user['name'] = payload.name;
    console.log(payload)
    console.log(this.user)
  }
}
