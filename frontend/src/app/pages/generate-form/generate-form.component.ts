import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-generate-form',
  templateUrl: './generate-form.component.html',
  styleUrls: ['./generate-form.component.css'],
})
export class GenerateFormComponent {
  loading: boolean = false
  formTitle: string = 'Form Name...';
  editors = [];
  status: string = 'Active';
  formModal: boolean = false;
  formId: string = ''
  generateForm: FormGroup = new FormGroup({
    fields: new FormArray([new FormControl(null)]),
  });
  @ViewChild('myModal') myModal: ElementRef;

  constructor(
    private http: HttpClient,
    private user: UserInfo,
    private router: Router,
    private socket: SocketService
  ) {}

  ngOnInit() {
    this.generateForm = new FormGroup({
      fields: new FormArray([]),
    });
  }

  saveDraft() {
    this.status = 'Draft';
    console.log(this.editors);
    this.onSubmit();
  }

  onSubmit() {
    const formData = this.generateForm.get('fields').value;
    if (formData.length > 0 && this.generateForm.valid) {
      this.loading = true
      const header = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.user.token}`
      );
      this.http
        .post(
          'http://localhost:3000/form',
          {
            form: formData,
            owner: this.user._id,
            title: this.formTitle,
            editors: this.editors,
            status: this.status,
          },
          { headers: header }
        )
        .subscribe(
          (res) => {
            this.loading = false
            console.log(res)
            // SOCKET MANAGEMENT FOR NEW FORM
            this.socket.subscribedForms.push(res['_id'])
            this.socket.joinNotify(res['_id'])
            this.formId = res['_id']
            if (this.status === 'Draft') {
              // Modal for confirmation of form saved
              this.formModal = true;
            } else {
              this.router.navigate([`/form/${res['_id']}`]);
            }
          },
          (err) => {
            this.loading = false
            console.log(err);
          }
        );
    } else if (formData.length === 0) {
      alert(
        "Form must contain atleast one Question (Make sure you click 'Done' after making change)"
      );
    } else {
      alert(
        "Question and type are necessary fields (Make sure you click 'Done' after making change)"
      );
    }
    
  }

  addField() {
    (<FormArray>this.generateForm.get('fields')).push(
      new FormGroup({
        ques: new FormControl(null, Validators.required),
        type: new FormControl(false),
        isRequired: new FormControl(false),
        options: new FormControl(null),
      })
    );
  }

  createControls(fieldDetails: Object, index: number) {
    console.log('Emit called');
    this.generateForm.get('fields').get(String(index)).patchValue(fieldDetails);
  }

  deleteField(index: number) {
    console.log(index);
    const formArray = this.generateForm.get('fields') as FormArray;
    formArray.removeAt(index);
    console.log(this.generateForm);
  }

  editForm() {
    this.router.navigate([`/form/edit/${this.formId}`])
  }
}
