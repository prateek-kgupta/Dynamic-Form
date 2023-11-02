import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/services/user-info.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css'],
})
export class EditFormComponent {
  formModal: boolean = false;
  loading: Boolean = false;
  formId: string = '';
  formTemplate: any = [];
  isOwner: Boolean = false;
  formTitle: string = 'Form Title';
  status: string = 'Active';
  editors = [];
  editorsDisplay = [];
  hasLoaded: boolean = false;
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

  ngOnDestroy() {
    if (this.hasLoaded) {
      const header = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.user.token}`
      );
      this.http
        .get(`${environment.BACKEND_URL}/form/editFailed/${this.formId}`, {
          headers: header,
        })
        .subscribe(
          (res) => console.log('This response is after destruction SUCCESS'),
          (err) => console.log('Something went wrong', err)
        );
    } else {
      console.log("Didn't go for API Call");
    }
  }

  getFormTemplate(formId: string = this.formId) {
    this.loading = true;

    this.http
      .get(`${environment.BACKEND_URL}/form/edit/${formId}`, )
      .subscribe(
        // RECIEVING FORM DATA FROM BACKEND
        (res) => {
          console.log(res);
          this.hasLoaded = true;
          // Assigning values to the local variables
          this.formTemplate = res['form'];
          this.formTitle = res['title'];
          this.editorsDisplay = res['editors'];
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
          this.loading = false;
        },
        (err) => {
          console.log(err);
          if (err.status === 404) {
            alert('No data found!!');
            this.router.navigate(['/']);
          } else if (err.status === 403) {
            alert(err.error.message);
            this.router.navigate(['/']);
          } else {
            alert('Something went wrong');
          }
          this.loading = false;
          console.log('Error', err);
        }
      );
  }

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
    this.status = status;
    if (!this.isOwner && status === 'Active') {
      this.status = 'Draft';
    }
    const editData = {
      form: this.editForm.value.fields,
      status,
      title: this.formTitle,
    };
    if (this.isOwner) {
      editData['editors'] = this.editors;
    }

    this.loading = true;
    this.http
      .patch(`${environment.BACKEND_URL}/form/edit/${this.formId}`, editData)
      .subscribe(
        (res) => {
          this.loading = false;
          if (this.status === 'Draft') {
            this.formModal = true;
          } else {
            this.router.navigate([`/form/${res['_id']}`]);
          }
        },
        (err) => {
          alert('Something went wrong');
          this.loading = false;
          this.router.navigate(['/']);
          console.log(err);
        }
      );
  }

  // CHANGE FORM ISEDITING STATUS TO TRUE IF WINDOW IS CLOSED
  @HostListener('window:beforeunload', ['$event'])
  onWindowClose(): void {
    if (this.hasLoaded) {
      const header = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.user.token}`
      );
      this.http
        .get(`${environment.BACKEND_URL}/form/editFailed/${this.formId}`, {
          headers: header,
        })
        .subscribe();
    }
  }
}
