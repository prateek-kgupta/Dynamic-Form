import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css'],
})
export class EditFormComponent {
  formModal: boolean = false;
  loading: Boolean = false
  formId: string = '';
  formTemplate: any = [];
  isOwner: Boolean = false;
  formTitle: string = 'Form Title';
  status: string = 'Active';
  editors = [];
  editorsDisplay = []
  editForm: FormGroup = new FormGroup({
    fields: new FormArray([]),
  });

  constructor(
    private user: UserInfo,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.formId = this.user.routeInfo.split('/').slice(-1)[0];
    console.log(this.formId);
    this.getFormTemplate(this.formId);
  }

  getFormTemplate(formId: string = this.formId) {
    this.loading = true
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );
    this.http
      .get(`http://localhost:3000/form/edit/${formId}`, {
        headers: header,
      })
      .subscribe(
        // RECIEVING FORM DATA FROM BACKEND
        (res) => {
          console.log(res)
          // Assigning values to the local variables
          this.formTemplate = res['form'];
          this.formTitle = res['title'];
          this.editorsDisplay = res['editors']
          this.editors = this.editorsDisplay.map((editor) => editor._id);
          this.isOwner = res['isOwner'];
          this.editForm = new FormGroup({
            fields: new FormArray([]),
          });

          // CREATING REACTIVE FORM BASED ON DATA PROVIDED BY THE BACKEND
          this.formTemplate.forEach((field, index) => {
            console.log(field);
            (<FormArray>this.editForm.get('fields')).push(
              new FormGroup({
                ques: new FormControl(field.ques, Validators.required),
                type: new FormControl(field.type),
                isRequired: new FormControl(field.isRequired),
                options: new FormControl(field.options),
              })
            );
          });
          this.loading = false
        },
        (err) => {
          if(err.status = 404){
            alert("No data found!!")
            this.router.navigate(['/'])
          }
          else{
            alert("Something went wrong")
          }
          this.loading = false
          console.log('Error', err);

        }
      );
  }

  // nullValidator() {}

  addField() {
    (<FormArray>this.editForm.get('fields')).push(
      new FormGroup({
        ques: new FormControl(null, Validators.required),
        type: new FormControl('text'),
        isRequired: new FormControl(false),
        options: new FormControl(['Option']),
      })
    );
  }

  createControls(fieldDetails: Object, index: number) {
    console.log('Values updated');
    this.editForm.get('fields').get(String(index)).patchValue(fieldDetails);
  }

  deleteField(index: number) {
    console.log(index);
    const formArray = this.editForm.get('fields') as FormArray;
    formArray.removeAt(index);
    console.log(this.editForm);
  }

  onSubmit(status = 'Draft') {
    if (!this.isOwner && status === 'Active') {
      status = 'Draft';
    }
    const editData = {
      form: this.editForm.value.fields,
      status,
      title: this.formTitle,
    };
    if(this.isOwner){
      editData['editors'] = this.editors
    }
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );
    this.loading = true
    this.http
      .patch(`http://localhost:3000/form/edit/${this.formId}`, editData, {headers: header})
      .subscribe(
        (res) => {
          this.loading = false
          if(this.status === 'Draft'){
            this.formModal = true
          }
          else{this.router.navigate([`/form/${res['_id']}`]);}
          // console.log(res);
        },
        (err) => {
          alert("Something went wrong")
          this.loading = false
          this.router.navigate(['/'])
          console.log(err);
        }
      );
  }
}
