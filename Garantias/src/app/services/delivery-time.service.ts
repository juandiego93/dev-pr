import { WarrantyService } from './warranty.service';
import { ExternalService } from 'src/app/services/external.service';
import { Injectable } from '@angular/core';
import { Util } from '../shared/util';
import { Subject } from 'rxjs';
import { CustomService } from './custom.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTimeService {

  constructor(private externaslService: ExternalService, private util: Util, private warrantyService: WarrantyService,
    private custom: CustomService) { }

  /**Funcion para calculo de dias festivos segun Si el CST atiende domingos o festivos
   * @author Frank
   */
  public CountDaysByDates(daysOfCST: number, numberDays: number) {
    console.log('daysOfCST',daysOfCST);
    let subject = new Subject<any>();

    //A la fecha actual le agrego el tiempo 00-00-00 (Horas-minutos-segundos) para que el cierre sea al final del día.
    let currentDate = new Date();
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
    currentDate.getTime();
    console.log('currentDate', currentDate);

    //Obtengo fecha inicial operando los días transcurridos de garantía
    let currentDateGuarantee = new Date();
    currentDateGuarantee.setDate(currentDateGuarantee.getDate() - numberDays);
    // console.log('currentDateGuarantee', currentDateGuarantee);

    let dateOfEstablishment = new Date(currentDateGuarantee);
    dateOfEstablishment.setDate(dateOfEstablishment.getDate() + 1);
    console.log('dateOfEstablishment', dateOfEstablishment);
    let dateOfEstablishmentResult = dateOfEstablishment.getTime();

    let dateArray = [];
    dateArray = this.GetDaysArray(dateOfEstablishmentResult, currentDate, daysOfCST);
    let countDays = dateArray.length;
    let countDaysWithoutSundays = countDays - daysOfCST;
    console.log('countDays', countDays);

    var arrayYears = [];
    arrayYears.push(dateOfEstablishment.getFullYear());
    arrayYears.push(currentDate.getFullYear());

    //Separo los 2 años cuando los días de CST son mayores a 90 días
    var uniqueArray = Array.from(new Set(arrayYears));
    uniqueArray = uniqueArray.sort();
    console.log('uniqueArray', uniqueArray);

    let arrHoliday;
    if (uniqueArray.length > 1) {
      this.externaslService.GetHolidayByYear(uniqueArray[0]).subscribe(response1 => {
        this.custom.DelCountError();
        this.externaslService.GetHolidayByYear(uniqueArray[1]).subscribe(response2 => {
          this.custom.DelCountError();
          if (response1.isValid && response2.isValid) {
            arrHoliday = response1.data.concat(response2.data);
            const totalDaysNoFullFilled = this.ResultComplianceDays(arrHoliday, dateArray, countDaysWithoutSundays);
            this.warrantyService.setBreachTimeDays = totalDaysNoFullFilled;
            subject.next(true);
          } else {
            subject.next(false);
            this.util.OpenAlert('No se pudo  obtener los días festivos.', false);
          }
        }, error=>{
          this.custom.AddCountError();
          subject.next(false);
      });
      }, error=>{
          this.custom.AddCountError();
          subject.next(false);
      });
    } else {
      this.externaslService.GetHolidayByYear(uniqueArray[0]).subscribe(response => {
        this.custom.DelCountError();
        if (response.isValid) {
          arrHoliday = response.data;
          const totalDaysNoFullFilled = this.ResultComplianceDays(arrHoliday, dateArray, countDaysWithoutSundays);
          this.warrantyService.setBreachTimeDays = totalDaysNoFullFilled;
          subject.next(true);
        } else {
          this.util.OpenAlert('No se pudo  obtener los días festivos.', false);
          subject.next(false);
        }
      }, error=>{
        this.custom.AddCountError();
        subject.next(false);
    });
    }
    return subject.asObservable();
  }

  /**Método encargado de omitir los domingos de las fechas
   * @author Frank
   */
  private GetDaysArray = (start, end, daysAttentionCST) => {
    let arr = [];
    for (var dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dateDay = new Date(dt);
      if (daysAttentionCST && dateDay.getDay() == 0) {
        dt.getDate() + 1;
      } else arr.push(new Date(dt));
    }
    return arr;
  }

  /**Método encargado de mostrar los días totales CST de cumplimiento y sus respectivos mensajes
   * @author Frank
   */
  private ResultComplianceDays (arrHolidays, dateArray, countDaysWithoutSundays){
    var arrHolidayRes = this.FormatDates(arrHolidays);
    var dateArrayRes = this.FormatDates(dateArray);
    console.log('Dates 1',dateArray);
    console.log('Dates 2',arrHolidayRes);

    var resultHoliday = arrHolidayRes.length > dateArrayRes.length ? this.CalcDays(arrHolidayRes, dateArrayRes) : this.CalcDays(dateArrayRes, arrHolidayRes);
    console.log('result holiday',resultHoliday);

    const totalDaysNoFullFilled = (countDaysWithoutSundays - resultHoliday);
    console.log('totalDaysNoFullFilled',totalDaysNoFullFilled);
    return totalDaysNoFullFilled;
  }

  /**Recibo los días sin el Domingo y los comparo con los días festivos
   * @author Frank
   */
  private CalcDays (resDaysIn, resDaysOn){
    let res = 0;
    for(let i = 0; i < resDaysIn.length; i++){
      for(let j = 0; j < resDaysOn.length; j++){
        if(resDaysIn[i] === resDaysOn[j] ) {
            res++;
        }
      }
    }
    return res;
  }

  /**Formateo del array de fechas
   * @author Frank
   */
  private FormatDates (arrData){
    var resValues = [];
      arrData.forEach(function(entry) {
        resValues.push(new Date(entry).toLocaleDateString());
    });
    return resValues;
  }
}



