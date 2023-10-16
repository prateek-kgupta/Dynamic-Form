import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  formList: any = [];
  currentUser: string = ''

  constructor(private http: HttpClient, private user: UserInfo, private router: Router) {}

  ngOnInit() {
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );

    this.http.get(`http://localhost:3000/form`, { headers: header }).subscribe(
      (res) => {
        console.log(res);
        this.formList = res;
        this.currentUser = this.user._id
      },
      (err) => {
        alert("Something went wrong")
        console.log(err);
      }
    );
  }
  openForm(formID){
    this.router.navigate([`/form/${formID}`])
  }

  submissions(event, formId){
    event.stopPropagation()
    console.log("Hello")
  }
}


