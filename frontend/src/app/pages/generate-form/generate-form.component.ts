import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-generate-form',
  templateUrl: './generate-form.component.html',
  styleUrls: ['./generate-form.component.css'],
})
export class GenerateFormComponent {
  
  formTitle: string = 'Form Name'
  generateForm: FormGroup = new FormGroup({
    fields: new FormArray([new FormControl(null)]),
  });

  

  constructor(private http: HttpClient, private user: UserInfo, private router: Router) {}

  ngOnInit() {
    this.generateForm = new FormGroup({
      fields: new FormArray([]),
    });
  }

  onSubmit() {
    const formData = this.generateForm.get('fields').value;
    console.log(formData);
    const header = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.user.token}`
    );
    this.http
      .post(
        'http://localhost:3000/form',
        { form: formData, owner: this.user._id, title: this.formTitle },
        { headers: header }
      )
      .subscribe( 
        (res) => {
          this.router.navigate([`/form/${res['_id']}`])

        },
        (err) => {
          console.log(err);
        }
      );
  }

  addField() {
    (<FormArray>this.generateForm.get('fields')).push(
      new FormGroup({
        ques: new FormControl(null),
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
}
