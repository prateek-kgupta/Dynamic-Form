import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Event, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UserInfo } from 'src/app/services/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  allForms: any = [];
  formList: any = [];
  currentUser: string = '';
  filterOn: string = 'available';
  modalData: any = [];
  modalFormId: string = '';

  constructor(
    private http: HttpClient,
    private user: UserInfo,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    console.log(
      'ON the dashboard\n',
      this.user,
      '\n Searching for token from cookie\n',
      this.cookieService.get('token')
    );

    this.http.get(`${environment.BACKEND_URL}/form`).subscribe(
      (res) => {
        console.log(res);
        this.allForms = res;
        this.formList = this.allForms.filter((form) => form.status !== 'Draft');
        console.log(this.formList);
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
    this.modalFormId = formId;
    // API call to get each submissions

    this.http
      .get(`${environment.BACKEND_URL}/response/responses/${formId}`)
      .subscribe(
        (res) => {
          console.log(res);
          this.modalData = res;
        },
        (err) => {
          console.log(err);
        }
      );
    console.log('Hello');
  }

  filterForm(command) {
    this.currentUser = this.user._id;
    if (!this.currentUser) {
      this.formList = this.allForms.filter((form) => form.status !== 'Draft');
      return;
    }
    this.filterOn = command;
    if (command === 'owner') {
      this.formList = this.allForms.filter(
        (form) => form.owner === this.currentUser
      );
    } else if (command === 'shared') {
      this.formList = this.allForms.filter(
        (form) =>
          form.owner === this.currentUser ||
          form.editors.includes(this.currentUser)
      );
    } else {
      this.formList = this.allForms.filter((form) => form.status !== 'Draft');
    }
  }

  fullResponse(ResponseId) {
    this.router.navigate([`/response/${ResponseId}`]);
  }

  changeStatus(formId, newStatus, oldStatus) {
    if (oldStatus === newStatus) {
      return;
    }

    this.http
      .patch(`${environment.BACKEND_URL}/form/editStatus/${formId}`, {
        status: newStatus,
      })
      .subscribe(
        (res) => {
          if (res['acknowledged']) {
            for (let form of this.formList) {
              if (form._id === formId) {
                form.status = newStatus;

                break;
              }
            }
            for (let form of this.allForms) {
              if (form._id === formId) {
                form.status = newStatus;
                break;
              }
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  deleteForm(formId) {
    this.http.delete(`${environment.BACKEND_URL}/form/delete/${formId}`).subscribe(
      (res) => {
        if (res['message'] === 'Deleted') {
          this.formList = this.formList.filter((form) => form._id !== formId);
          this.allForms = this.allForms.filter((form) => form._id !== formId);
        }
      },
      (err) => {
        if (err.error.message === 'Invalid Request') {
          alert('Invalid Request');
        } else {
          alert('Something went wrong');
        }
      }
    );
  }

  responseChart() {
    this.router.navigate([`/response-sheet/${this.modalFormId}`]);
  }
}
