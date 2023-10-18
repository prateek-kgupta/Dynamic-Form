import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Event, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  allForms: any = [];
  formList: any = [];
  currentUser: string = '';
  filterOn: boolean = false;
  modalData: any = []

  constructor(
    private http: HttpClient,
    private user: UserInfo,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    console.log("ON the dashboard\n",this.user, '\n Searching for token from cookie\n',this.cookieService.get('token'))
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );

    this.http.get(`http://localhost:3000/form`, { headers: header }).subscribe(
      (res) => {
        console.log(res);
        this.allForms = res;
        // this.formList = res;
        this.formList = this.allForms;
        this.currentUser = this.user._id;
        console.log(this.currentUser);
      },
      (err) => {
        alert('Something went wrong');
        console.log(err);
      }
    );
  }
  openForm(formID) {
    this.router.navigate([`/form/${formID}`]);
  }

  submissions(event, formId) {
    event.stopPropagation();
    // API call to get each submissions
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );

    this.http
      .get(`http://localhost:3000/response/responses/${formId}`, { headers: header })
      .subscribe(
        (res) => {
          console.log(res);
          this.modalData = res
        },
        (err) => {
          console.log(err);
        }
      );
    console.log('Hello');
  }
  

  toggleView() {
    // this.filterOn = !this.filterOn
    this.currentUser = this.user._id;
    if (!this.currentUser) {
      this.filterOn = false;
      this.formList = this.allForms;
    } else if (this.filterOn) {
      this.filterOn = false;
      this.formList = this.allForms;
    } else {
      this.filterOn = true;
      this.formList = this.allForms.filter(
        (form) => form.owner === this.currentUser
      );
    }
  }

  fullResponse(ResponseId){
    this.router.navigate([`/response/${ResponseId}`])
  }
}
