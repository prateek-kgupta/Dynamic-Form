import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import { NavigationEnd, Router, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserInfo } from 'src/app/services/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.component.html',
  styleUrls: ['./view-form.component.css'],
})
export class ViewFormComponent {
  formId: string = '';
  formTemplate: any = [];
  formTitle: string = 'Form Title';
  Draft: boolean = false;
  showChat: boolean = false;
  status: string = '';
  loading: boolean = false;
  responseForm: FormGroup = new FormGroup({
    fields: new FormArray([]),
  });
  eventSubscription: Subscription;

  constructor(
    private user: UserInfo,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.formId = this.user.routeInfo.split('/').slice(-1)[0];
    console.log(this.formId);
    this.getFormTemplate(this.formId);
    this.eventSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        console.log("Route Called")
        const newFormId = event.url.split('/').slice(-1)[0];
        if (newFormId !== this.formId) {
          this.formId = newFormId;
          this.formTemplate = [];
          this.formTitle = 'Form Title';
          this.Draft = false;
          this.showChat = false;
          this.status = '';
          this.loading = false;
          this.responseForm = new FormGroup({
            fields: new FormArray([]),
          });

          this.getFormTemplate(this.formId);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  getFormTemplate(formId: string = this.formId) {
    this.loading = true;

    this.http
      .get(`${environment.BACKEND_URL}/form/${formId}`)
      .subscribe(
        // RECIEVING FORM DATA FROM BACKEND
        (res) => {
          this.loading = false;
          console.log(res);
          this.Draft = res['status'] === 'Draft';
          this.status = res['status'];
          if (this.status !== 'Active') {
            this.router.navigate(['/']);
          }
          this.formTemplate = res['form'];
          this.formTitle = res['title'];
          this.responseForm = new FormGroup({
            fields: new FormArray([]),
          });

          // CREATING REACTIVE FORM BASED ON DATA PROVIDED BY THE BACKEND
          this.formTemplate.forEach((field, index) => {
            if (field['isRequired']) {
              (<FormArray>this.responseForm.get('fields')).push(
                new FormGroup({
                  questionId: new FormControl(field._id),
                  response: new FormArray(
                    [],
                    this.nullValidator(field['type'])
                  ),
                })
              );
            } else {
              (<FormArray>this.responseForm.get('fields')).push(
                new FormGroup({
                  questionId: new FormControl(field._id),
                  response: new FormArray([]),
                })
              );
            }
            const responseArray = this.responseForm
              .get('fields')
              .get(String(index))
              .get('response') as FormArray;
            if (field.type === 'checkbox') {
              for (let option of field.options) {
                (<FormArray>responseArray).push(new FormControl(false));
              }
            } else {
              (<FormArray>responseArray).push(new FormControl(null));
            }
          });
        },
        (err) => {
          console.log(err);
          alert(err.error.message);
          this.router.navigate(['/']);
          this.loading = false;
          console.log('Error', err);
        }
      );
  }

  nullValidator(type: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      if (type !== 'checkbox' && formArray.value[0]) {
        return null;
      } else if (type === 'checkbox' && formArray.value.includes(true)) {
        return null;
      } else {
        return { ValidatorError: 'required' };
      }
    };
  }

  onSubmit() {
    if (this.responseForm.valid) {
      const responseData = {
        formId: this.formId,
        responses: this.responseForm.value.fields,
      };
      const header = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.user.token}`
      );
      this.http
        .post(`${environment.BACKEND_URL}/response`, responseData, {
          headers: header,
        })
        .subscribe(
          (res) => {
            console.log(res);
            this.router.navigate([`/response/${res['_id']}`]);
          },
          (err) => {
            console.log(err);
          }
        );
    } else {
      alert('Must answer every required fields');
    }
  }
}
