import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-option-field',
  templateUrl: './option-field.component.html',
  styleUrls: ['./option-field.component.css']
})
export class OptionFieldComponent {
  @Input() types: String = 'text'
  @Input() options: String[] = []

  updateValue(index: number, e: Event){
    const element = e.target as HTMLInputElement
  
    this.options[index] = element.value
    console.log(this.options)
  }
  removeOption(index: number){
    this.options.splice(index, 1)
  }

  addOption(){
    console.log('Hello')
    this.options.push('Option')
    console.log("add:\n",this.options)
  }
}
