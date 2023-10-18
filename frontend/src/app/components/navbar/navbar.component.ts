import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  token: string = '';
  name: string = ''
  constructor(
    private cookieService: CookieService,
    private router: Router,
    private user: UserInfo
  ) {
    // this.token = this.user.token
  }

  ngOnInit() {
    this.token = this.cookieService.get('token');
    if (this.token) {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      // set values to user-info service
      this.user.token = this.token;
      this.user.loggedIn = true;
      this.user['_id'] = payload._id;
      this.user['name'] = payload.name;
      this.name = payload.name
    }
  }

  changeLog() {
    if (this.token) {
      console.log("Delete token")
      this.cookieService.delete('token', '/');
      console.log(this.cookieService.get('token'))
      this.name = ''
      this.token = '';
      this.user.token = '';
      this.user['_id'] = '';
      this.user['name'] = '';
      this.router.navigate(['/']);
      this.user.loggedIn = false
      console.log(this.user)
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngDoCheck(){
    this.token = this.user.token
    this.name = this.user.name
  }
}