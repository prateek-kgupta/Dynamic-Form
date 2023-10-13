import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.component.html',
  styleUrls: ['./view-form.component.css'],
})
export class ViewFormComponent {
  formId: string = '';
  formTemplate: any = [];
  formTitle: string = 'Form Title';
  responseForm: FormGroup = new FormGroup({
    fields: new FormArray([]),
  });

  constructor(private user: UserInfo, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.formId = this.user.routeInfo.split('/').slice(-1)[0];
    console.log(this.formId);
    this.getFormTemplate(this.formId);
  }

  getFormTemplate(formId: string = this.formId) {
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );
    this.http
      .get(`http://localhost:3000/form/${formId}`, { headers: header })
      .subscribe(
        // RECIEVING FORM DATA FROM BACKEND
        (res) => {
          // console.log(res);
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
        .post(`http://localhost:3000/response`, responseData, {
          headers: header,
        })
        .subscribe(
          (res) => {
            console.log(res);
            this.router.navigate([`/response/${res['_id']}`])
          },
          (err) => {
            console.log(err);
          }
        );
    }
    // console.log(this.responseForm.value.fields);
    console.log(this.responseForm);
    console.log(this.responseForm.valid);
  }
}
