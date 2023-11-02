import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserInfo } from 'src/app/services/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.css'],
})
export class VerifyAccountComponent {
  loading: Boolean = false;
  error: Boolean = false;
  errorMessage: string = '';
  slug: string = '';

  constructor(private http: HttpClient, private user: UserInfo) {}

  ngOnInit() {
    this.loading = true
    this.slug = this.user.routeInfo.split('/').slice(-1)[0];
    console.log(this.slug)
    this.http.get(`${environment.BACKEND_URL}/user/verify/${this.slug}`).subscribe(
      (res) => {
        this.loading = false
        console.log(res['status'], res['message']);
        if(res['message'] === 'success'){
          this.error = false
        }
      },
      (err) => {
        this.loading = false
        this.error = true
        console.log(err);
      }
    );
  }
}
