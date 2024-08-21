import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private httpClient = inject(HttpClient);
  private apiUrl = "http://localhost:8080/api/"

  constructor(
    httpClient: HttpClient
  ) { }

  writtenDateToApi(currency: string, date: string): Observable<HttpResponse<any>> {
    return this.httpClient.get<any>(this.apiUrl+currency+"/"+date, {observe: 'response'});
  }

  selectedDateToApi(currency: string, year:number): Observable<HttpResponse<any>> {
    return this.httpClient.get<any>(this.apiUrl+currency+"/"+year, {observe: 'response'});
  }

  writtenYearToApi(currency: string, year: number): Observable<HttpResponse<any>> {
    return this.httpClient.get<any>(this.apiUrl+currency+"/"+year, {observe: 'response'});
  }


}
