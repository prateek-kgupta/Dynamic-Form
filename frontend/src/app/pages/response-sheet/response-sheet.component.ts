import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserInfo } from 'src/app/services/user-info.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx'


@Component({
  selector: 'app-response-sheet',
  templateUrl: './response-sheet.component.html',
  styleUrls: ['./response-sheet.component.css'],
})
export class ResponseSheetComponent {
  formId: string = '';
  sheetData: any = [];
  loading: boolean = false
  @ViewChild('responseSheet') responseSheet: ElementRef;

  constructor(private user: UserInfo, private http: HttpClient) {}

  ngOnInit() {
    this.formId = this.user.routeInfo.split('/').slice(-1)[0];
    this.getSheetData();
  }
  getSheetData() {
    this.loading = true

    this.http
      .get(`${environment.BACKEND_URL}/response/allResponses/${this.formId}`)
      .subscribe(
        (res) => {
          this.loading = false
          this.sheetData = res;
        },
        (err) => {
          alert("Something went wrong")
          this.loading = false
        }
      );
  }

  exportExcel() {
    const responseSheet = this.responseSheet.nativeElement as HTMLElement;
    const workbook = XLSX.utils.table_to_book(responseSheet);
    XLSX.writeFile(workbook, `${this.sheetData.title}.xls`);
  }
}
