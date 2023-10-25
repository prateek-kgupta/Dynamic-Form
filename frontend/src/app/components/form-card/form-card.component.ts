import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.css'],
})
export class FormCardComponent {
  @Input() question: String = '';
  @Input() type: String = 'text';
  @Input() isRequired = false;
  @Input() options = ['Option'];

  @Output() fieldDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeField: EventEmitter<any> = new EventEmitter<any>()

  sendFieldDetails() {
    if (this.type === 'text' || this.type === 'number') {
      this.options = [];
    }
    this.fieldDetails.emit({
      ques: this.question,
      type: this.type,
      isRequired: this.isRequired,
      options: this.options,
    });
  }

  deleteField(){
    this.removeField.emit()
  }
}
