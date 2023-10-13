import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-show-response',
  templateUrl: './show-response.component.html',
  styleUrls: ['./show-response.component.css'],
})
export class ShowResponseComponent {
  responseId: string = '';
  formTitle: string = '';
  responseData = []
  formToResponse = []

  constructor(private user: UserInfo, private http: HttpClient) {}

  ngOnInit() {
    this.responseId = this.user.routeInfo.split('/').slice(-1)[0];
    this.getFormResponse(this.responseId);
  }

  getFormResponse(responseId = this.responseId) {
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );

    this.http.get(`http://localhost:3000/response/${responseId}`, {headers: header})
    .subscribe((res)=>{
      this.responseData = res[0]['responses']
      this.formTitle = res[0]['forms'][0]['title']
      this.formToResponse = res[0]['forms'][0]['form']
      console.log("response",this.responseData)
      console.log("form", this.formToResponse)
    },(err) => {
      console.log(err)
    })
  }
}
