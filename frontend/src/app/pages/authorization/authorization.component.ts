import { HttpClient } from '@angular/common/http';
import { Component} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.css'],
})
export class AuthorizationComponent {
  loginForm: FormGroup;
  signupForm: FormGroup;

  login: Boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });

    this.signupForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
      rePass: new FormControl(null, Validators.required),
    });
  }

  setToken(token: string) {
    this.cookieService.set('token', token);
  }

  loginSubmit() {
    console.log(this.loginForm);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.http
        .post('http://localhost:3000/user/login', { email, password })
        .subscribe(
          (res) => {
            this.setToken(res['token']);
            this.router.navigate(['/']);
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  signupSubmit() {
    if (
      this.signupForm.valid &&
      this.signupForm.value.password === this.signupForm.value.rePass
    ) {
      const { name, email, password } = this.signupForm.value;
      this.http
        .post('http://localhost:3000/user/signup', { name, email, password })
        .subscribe(
          (res) => {
            this.setToken(res['token']);
            this.router.navigate(['/']);
          },
          (err) => {
            console.log(err);
          }
        );

      // Api call
    } else {
      console.log('Each field is necessary and passwords must match');
    }
  }
  toggle() {
    this.login = !this.login;
  }
}
