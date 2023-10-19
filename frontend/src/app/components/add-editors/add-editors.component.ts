import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-add-editors',
  templateUrl: './add-editors.component.html',
  styleUrls: ['./add-editors.component.css'],
})
export class AddEditorsComponent {
  @Input() editors = [];
  editorsDisplay = []
  searchTerm: string = ''
  searchResults: any = []
  showUsers: Boolean = false

  constructor(private user: UserInfo, private http: HttpClient) {}

  getUser() {
    // http request to get user from database
    const token = this.user.token;
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );
    this.http.get(`http://localhost:3000/user/getUser/${this.searchTerm}`, { headers: header }).subscribe(
      (res) => {
        console.log(res);
        this.searchResults = res
        this.showUsers = true
      },
      (err) => {
        console.log(err);
      }
    );
  }
  addEditor(user){
    this.editors.push(user._id)
    this.editorsDisplay.push(user)
    this.showUsers = false
    // this.searchResults.splice(index, 1)
  }

  removeEditor(index){
    // this.searchResults.push(this.editorsDisplay[index])
    this.editors.splice(index, 1)
    this.editorsDisplay.splice(index, 1)

  }

}