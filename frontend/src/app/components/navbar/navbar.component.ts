import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from 'src/app/services/socket.service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  token: string = '';
  name: string = '';
  notificationList = [];

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private user: UserInfo,
    private socket: SocketService
  ) {
    // this.token = this.user.token
  }

  ngOnInit() {
    this.token = this.cookieService.get('token');
    if (this.token) {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      // Connect to the socket service
      this.socket.connect(payload._id);
      //

      this.notificationList = this.socket.notifications;

      // set values to user-info service
      this.user.token = this.token;
      this.user.loggedIn = true;
      this.user['_id'] = payload._id;
      this.user['name'] = payload.name;
      this.name = payload.name;
      // ADD OBSERVABLE TO GET NEW NOTIFICATIONS
      this.socket.on('notifications').subscribe(() => {
        this.notificationList = this.socket.notifications;
      });
    }
  }

  changeLog() {
    if (this.token) {
      console.log('Delete token');
      this.cookieService.delete('token', '/');
      console.log(this.cookieService.get('token'));

      this.name = '';
      this.token = '';
      // Clear User Service
      this.user.token = '';
      this.user['_id'] = '';
      this.user['name'] = '';
      this.router.navigate(['/']);
      this.user.loggedIn = false;
      // Clear Socket Service
      this.socket.chats = {};
      this.socket.subscribedForms = [];
      this.socket.notifications = [];
      this.socket.disconnect();
      // Clear notification list in this component
      this.notificationList = [];

      console.log(this.socket);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToChat(formId){
    // ROUTE TO ABOVE FORM ID
    // REMOVE THIS ELEMENT FROM NOTIFICATION LIST
    console.log("goToChat called")
    this.notificationList = this.notificationList.filter(notification => notification.roomId !== formId)
    this.socket.removeNotification(formId)
    this.router.navigate([`/form/${formId}`])
    // REMOVE THIS ELEMENT FROM USERS->NOTIFICATIONS
  }

  deleteAll(){
    this.notificationList = []
   this.socket.removeAllNotifications() 
  }

  ngDoCheck() {
    this.token = this.user.token;
    this.name = this.user.name;
  }
}
