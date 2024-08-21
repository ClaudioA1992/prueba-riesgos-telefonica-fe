import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from './app.service';
import { HttpErrorResponse, HttpResponse, withRequestsMadeViaParent } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'prueba-riesgos-telefonica-frontend';
  years: number[] = []
  form: FormGroup;
  months:Month[] = [];
  currencies = [''];
  selectedMonth = '';
  responseString = '';
  info = false;
  infoShown = "";
  infoTitle = "";

  todayCurrency: number = 0;
  dayCurrency: number = 0;
  difCurrencies: number = 0;
  percentageVariation: number = 0;
  percentageVariationText: string = "";
  currencySelected: string = "";
  utmValue: number = 0;

  mean: string = "";
  median: number = 0;
  daysMoneyValueDifference = 0;
  firstMonthDayCurrency = 0;
  lastMonthDayCurrency = 0;
  modes: number[] = [];
  repetitionModes: number = 0;
  yearQueried = 0;

  averageArray: {value: string, monthNumber: number}[] = [];
  percentageVariationArray: {value: string, monthNumber: number}[] = [];
  utmArray: {value: number, monthNumber: number}[] = [];

  errorMessage = "";
  errorEvent = false;

  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private service: AppService
  ) {
    this.form = this.formBuilder.group({
      dropdownCurrency: [{value: "", disabled: false}, Validators.required],
      writtenDate: [{value: "", disabled: false}],
      dropdownYear: [{value: 0, disabled: false}],
      dropdownMonth: [{value: 0, disabled: false}],
      writtenYear: [{value: "", disabled: false}]
    });
    this.months.push(new Month("Enero", 1));
    this.months.push(new Month("Febrero", 2));
    this.months.push(new Month("Abril", 4));
    this.months.push(new Month("Mayo", 5));
    this.months.push(new Month("Junio", 6));
    this.months.push(new Month("Marzo", 3));
    this.months.push(new Month("Julio", 7));
    this.months.push(new Month("Agosto", 8));
    this.months.push(new Month("Septiembre", 9));
    this.months.push(new Month("Octubre", 10));
    this.months.push(new Month("Noviembre", 11));
    this.months.push(new Month("Diciembre", 12));
    this.currencies.push("uf");
    this.currencies.push("dolar");
    this.currencies.push("euro");
    this.currencies.push("utm");
  }

  ngOnInit(): void {
    for(var i = 1977; i < 2025; i++){
      this.years.push(i);
    }
  }

  callWrittenDate() {

    console.log("Fecha escrita: " + this.form.value.writtenDate);
    
    this.resetVariables();

    this.isLoading = true;

    if(this.form.value.dropdownCurrency == "" || this.form.value.writtenDate == "") {
      this.info = true;
      this.errorMessage = "Ingresa todos los datos requeridos.";
      this.isLoading = false;
      return
    }

    this.service.writtenDateToApi(this.form.value.dropdownCurrency, this.form.value.writtenDate).subscribe({
      
      next: (response: HttpResponse<any>) => {
     
        this.resetVariables();
        this.responseString = JSON.stringify(response);
        this.info = true;

        if(response.status == 200) {
          
          if(response.body.serie.length > 0) {
            console.log("DATA: " + JSON.stringify(this.responseString));
            this.dayCurrency = response.body.serie[0].valor;
            const currentDate = new Date();
            let dateConstruction = currentDate.getDate()+"-"+(currentDate.getMonth()+1)+"-"+currentDate.getFullYear();
            this.infoTitle = "Diferencia porcentual desde día " + dateConstruction + " a hoy:";
            console.log("Date: " + dateConstruction);
            this.service.writtenDateToApi(this.form.value.dropdownCurrency, dateConstruction).subscribe({next: (response) => {
            if(response.status == 200) {
              if(response.body.serie.length > 0) {
                this.infoShown = 'dateWritten';
                this.todayCurrency = response.body.serie[0].valor;
                this.currencySelected = this.form.value.dropdownCurrency;
                this.difCurrencies = this.todayCurrency - this.dayCurrency;
                console.log("Dif currencies: "+ this.difCurrencies);
                this.percentageVariation = 100*(this.difCurrencies/this.dayCurrency);
                console.log("Variación: "+ this.percentageVariation);
                this.percentageVariationText = this.percentageVariation.toFixed(3)+"%";
              } else {
                this.errorMessage = "No existen datos de la fecha actual, o ocurrió un error inesperado.";
              }
            } else{
              console.log("ERROR 2");
              console.log("Status error: " + response.status);
              this.info = false;
              }
            }});
          } else {
            this.errorMessage = "No existen datos para la fecha ingresada. Existe la posibilidad que sea un día de fin de semana, o festivo.";
          }
        } else {
          console.log("ERROR");
          console.log("Status de error: " + response.status);
          this.info = true;
          this.errorEvent = true;
          this.infoShown = 'dateWritten';
          this.errorMessage = "Error con la llamada a la API";
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log("ERROR");
        console.log("Status de error: " + error.status);
        this.info = true;
        this.errorEvent = true;
        this.isLoading = false;
        this.errorMessage = "Error con la llamada a la API: " + "\'" + error.message + "\'";
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  callSelectedDate() {

    console.log("Fecha escrita: " + this.form.value.dropdownYear + "/" + this.form.value.dropdownMonth);

    this.resetVariables();

    this.isLoading = true;

    console.log("Values: " + this.form.value.dropdownCurrency +
       " " + this.form.value.dropdownYear +
       " " + this.form.value.dropdownMonth)

    if(this.form.value.dropdownCurrency == "" || this.form.value.dropdownYear == 0 || this.form.value.dropdownMonth == 0) {
      this.info = true;
      this.errorMessage = "Ingresa todos los datos requeridos.";
      this.isLoading = false;
      return
    }

    this.service.selectedDateToApi(this.form.value.dropdownCurrency, this.form.value.dropdownYear).subscribe({
      
      next: (response: HttpResponse<any>) => {
      
        this.resetVariables();
        this.responseString = JSON.stringify(response);

        if(response.status == 200) {

          this.infoShown = "dateSelected";
          this.info = true;
          this.currencySelected = this.form.value.dropdownCurrency;
          this.infoTitle = "Variación de moneda en pesos chilenos de " + this.currencySelected+ " en "+ this.getMonthName(this.form.value.dropdownMonth) + " de " + this.form.value.dropdownYear +":";
          console.log("DATA: " + JSON.stringify(this.responseString));
          console.log("Month dropdown: " + this.form.value.dropdownMonth);

          if(response.body.serie.length > 1 && this.currencySelected != "utm") {

            let daysOfMonth = this.getDaysOfMonth(response.body.serie, this.form.value.dropdownMonth, this.form.value.dropdownYear);
            this.mean = this.valueTrimming(this.getAverage(daysOfMonth));
            this.modes = this.getMode(daysOfMonth);
            console.log("Modes: " + this.modes + " Modes length: " + this.modes.length);
            console.log("Days of the month from filter: " + JSON.stringify(daysOfMonth));
            console.log("reponse.body.serie: " + response.body.serie);
            let edgeDays = this.getFirstAndLastDayOfMonth(daysOfMonth, this.form.value.dropdownMonth, this.form.value.dropdownYear);
            this.firstMonthDayCurrency = edgeDays.firstDay.valor;
            this.lastMonthDayCurrency = edgeDays.lastDay.valor;
            this.daysMoneyValueDifference = edgeDays.lastDay.valor - edgeDays.firstDay.valor;
            this.percentageVariation = this.percentageVariation = 100*(this.daysMoneyValueDifference/edgeDays.firstDay.valor);
            this.percentageVariationText = this.valueTrimming(this.percentageVariation);

          } else if(this.currencySelected == "utm" && response.body.serie.length > 0) {
            this.utmValue = response.body.serie[0].valor;
          } else if(response.body.serie.length == 1) {
            this.daysMoneyValueDifference = 0;
            this.percentageVariation = 0;
            this.errorMessage = "El mes ingresado solo tiene un mes registrado.";
          } else {
            this.infoShown = "";
            this.errorMessage = "No existen registros en el mes ingresado.";
          }

        } else {
          console.log("ERROR");
          console.log("Status de error: " + response.status);
          this.errorEvent = true;
          this.info = false;
        }

      }, 
      error: (error: HttpErrorResponse) => {
        console.log("ERROR");
        console.log("Status de error: " + error.status);
        this.errorMessage = "Error con la llamada a la API: " + "\'" + error.message + "\'";
        this.errorEvent = true;
        this.info = true;
        this.isLoading = false;
      }, 
      complete: () => {
        this.isLoading = false;
      }
    });

  }

  callWrittenYear() {

    console.log("Fecha escrita: " + this.form.value.writtenYear);

    this.resetVariables();

    this.isLoading = true;

    if(this.form.value.dropdownCurrency == "" || this.form.value.writtenYear == "") {
      this.info = true;
      this.errorMessage = "Ingresa todos los datos requeridos.";
      this.isLoading = false;
      return
    }

    this.service.writtenYearToApi(this.form.value.dropdownCurrency, this.form.value.writtenYear).subscribe({
      
      next: (response: HttpResponse<any>) => {
      
        this.resetVariables();
        this.responseString = JSON.stringify(response);
        this.currencySelected = this.form.value.dropdownCurrency;
        let writtenYear = this.form.value.writtenYear;
        this.yearQueried = this.form.value.writtenYear;
        this.info = true;
        
        if(response.status == 200 && response.body.serie.length > 0) {
         
          this.infoShown = "yearWritten";
          console.log("DATA: " + JSON.stringify(this.responseString));

          console.log(this.currencySelected);

          if(this.currencySelected != "utm") {
            for(let i = 1; i < 13; i++) {
              let daysOfTheMonth = this.getDaysOfMonth(response.body.serie, i, writtenYear);
              let auxAverage = this.getAverage(daysOfTheMonth);
              if(auxAverage != 0 && auxAverage != null && auxAverage != undefined && daysOfTheMonth.length > 0) {
                console.log("auxAverage: " + auxAverage);
                let averageTrimmed = this.valueTrimming(auxAverage);
                this.averageArray.push({ value: averageTrimmed, monthNumber: i });
                let edgeDays = this.getFirstAndLastDayOfMonth(daysOfTheMonth, i, writtenYear);
                this.daysMoneyValueDifference = edgeDays.lastDay.valor - edgeDays.firstDay.valor;
                this.percentageVariationArray.push({value: this.valueTrimming(100*(this.daysMoneyValueDifference/edgeDays.firstDay.valor)), monthNumber: i});
              }
            }
          } else {
            console.log("Days of the month UTM: " + JSON.stringify(response.body.serie));
            for(let i = 0; i < response.body.serie.length; i++) {
              this.utmArray.push({value: response.body.serie[i].valor, monthNumber: new Date(response.body.serie[i].fecha).getMonth()+1});
            }
          };

          this.yearQueried = writtenYear; 

        } else {
          this.errorEvent = true;
          this.infoShown = "yearWritten";
          this.errorMessage = "No existen datos para este año.";
        }
      }, error: (error: HttpErrorResponse) => {
        this.info = true;
        this.infoShown = "yearWritten";
        this.errorEvent = true;
        this.isLoading = false;
        this.errorMessage = "Error con la llamada a la API: " + "\'" + error.message + "\'";
      }, complete: () => {
        this.isLoading = false;
      }});
  }

  getDaysOfMonth(data: any[], month: number, year: number) {
    console.log("Data in days of the month: " + JSON.stringify(data));

    const filteredData = data.filter(item => {
      const date = new Date(item.fecha);
      return date.getMonth()+1 == month && date.getFullYear() == year;
    });

    return filteredData;
  }

  getFirstAndLastDayOfMonth(data: any[], month: number, year: number) {

    console.log("Data filtering: " + JSON.stringify(data));
    
    data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const firstDay = data[0];
    const lastDay = data[data.length - 1];
    console.log("Days: " + firstDay.fecha + " " + lastDay.fecha);
    return { firstDay, lastDay };

  }

  valueTrimming(value: number): string {
    return value.toFixed(3);
  }

  getAverage(daysCurrencyValue: any[]) {
    let sum = 0;
    for(let i = 0; i < daysCurrencyValue.length; i++) {
      sum = sum + daysCurrencyValue[i].valor;
    }
    return sum / daysCurrencyValue.length;
  }

  getMode(daysCurrencyValue: any[]) {
    // Paso 1: Extraer los valores
    const valores = daysCurrencyValue.map(item => Math.round(item.valor));

    // Paso 2: Contar las ocurrencias de cada valor
    const countMap: Record<number, number> = valores.reduce((acc: Record<number, number>, value: number) => {
      acc[value] = (acc[value] || 0) + 1; // Incrementa el contador para el valor
      return acc;
    }, {});

    // Paso 3: Encontrar todas las modas (valores con ocurrencias máximas)
    let maxCount = 0;
    const modas: number[] = [];

    for (const [value, count] of Object.entries(countMap)) {
      const numericValue = Number(value);
      if (count > maxCount) {
        maxCount = count;
        this.repetitionModes = maxCount;
        modas.length = 0;
        modas.push(numericValue);
      } else if (count === maxCount) {
        modas.push(numericValue);  // Agrega el valor si tiene el mismo máximo
      }
    }

    return modas;

  }

  getMonthName(monthNumber: number): string {
    const month = this.months.find(m => m.number == monthNumber);
    return month ? month.name : 'Mes no encontrado';
  }

  resetVariables() {

    this.averageArray.length = 0;
    this.percentageVariationArray.length = 0;
    this.utmArray.length = 0;

    this.selectedMonth = '';
    this.responseString = '';
    this.info = false;
    this.infoShown = "";
    this.infoTitle = "";
  
    this.todayCurrency = 0;
    this.dayCurrency = 0;
    this.difCurrencies = 0;
    this.percentageVariation = 0;
    this.percentageVariationText = "";
    this.currencySelected = "";
    this.utmValue = 0;
  
    this.mean = "";
    this.median = 0;
    this.repetitionModes = 0;
    this.daysMoneyValueDifference = 0;
    this.firstMonthDayCurrency = 0;
    this.lastMonthDayCurrency = 0;
    this.modes.length = 0;
    this.yearQueried = 0;

    this.errorMessage = "";
    this.errorEvent = false;

  }

  formatDate(event: Event): void {

    const input = event.target as HTMLInputElement; 

    let value = input.value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    let formattedValue = '';
  
    if (value.length > 0) {
      formattedValue += value.substring(0, 2);
    }
    if (value.length > 2) {
      formattedValue += '-' + value.substring(2, 4);
    }
    if (value.length > 4) {
      formattedValue += '-' + value.substring(4, 8);
    }
  
    input.value = formattedValue;
  
    // Validar el formato completo cuando tiene 10 caracteres
    if (value.length === 8) {
      const regex = /^\d{2}-\d{2}-\d{4}$/;
      const errorMessageInput = document.getElementById('error-message')!;
      if (!regex.test(input.value)) {
        errorMessageInput.style.display = 'block';
      } else {
        errorMessageInput.style.display = 'none';
      }
    }
  }

  formatYearDate(event:Event): void {
    const input = event.target as HTMLInputElement; 

    let value = input.value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    input.value = value;

  }

}



export class Month {
  constructor(public name: string, public number: number) {};
}
