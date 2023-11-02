import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

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
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
    });

    this.signupForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(20),
      ]),
      rePass: new FormControl(null, [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(20),
      ]),
    });
  }

  setToken(token: string) {
    this.cookieService.set('token', token, 1, '/');
  }

  loginSubmit() {
    console.log(this.loginForm);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.http
        .post(`${environment.BACKEND_URL}/user/login`, { email, password })
        .subscribe(
          (res) => {
            this.setToken(res['token']);
            this.router.navigate(['/']);
          },
          (err) => {
            if (err.status === 403) {
              this.loginForm.patchValue({
                password: ''
              })
              alert(
                'Please verify your account through the link received on email'
              );
              this.loginForm.markAsUntouched();
            } else {
              alert('Invalid Credentials');
              console.log(err);
            }
          }
        );
    } else {
      alert('Please provide proper details in every field');
    }
  }

  signupSubmit() {
    if (
      this.signupForm.valid &&
      this.signupForm.value.password === this.signupForm.value.rePass
    ) {
      const { name, email, password } = this.signupForm.value;
      this.http
        .post(`${environment.BACKEND_URL}/user/signup`, { name, email, password })
        .subscribe(
          (res) => {
            console.log(res);
            console.log(res['message']);
            if (res['message'] === 'Success') {
              console.log('Before marking', this.signupForm);
              // console.log(this.signupForm.get('controls'))
              this.signupForm.setValue({
                name: '',
                email: '',
                password: '',
                rePass: ''
              })
              this.signupForm.markAsUntouched();
              console.log('After marking', this.signupForm);
              alert(
                'You have registered succesfully. Verify yourself using the link sent to you on email and login again'
              );
              this.login = true;
            }
          },
          (err) => {
            alert('Make sure email is valid or is not registered earlier');
            console.log(err);
          }
        );

      // Api call
    } else {
      if (this.signupForm['controls']['email'].invalid) {
        alert('Please provide a valid email');
      } else if (this.signupForm['controls']['password'].invalid) {
        alert('Password must be 7-20 characters long');
      } else {
        alert('Each field is necessary and passwords must match');
      }
    }
  }
  toggle() {
    this.login = !this.login;
  }

  googleSignIn() {
    window.location.href = `${environment.BACKEND_URL}/user/auth/google`;
  }
}
