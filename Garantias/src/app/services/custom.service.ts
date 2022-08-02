import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Parameter } from '../models/parameter';

@Injectable({
  providedIn: 'root'
})
export class CustomService {

  private count = 0;
  private countError = 0;
  private messageError ='';
  private parameter= new Parameter;
  private imeiStr: string;


  private requestInterceptedSource: Subject<any> = new Subject<any>();
  requestIntercepted: Observable<any> = this.requestInterceptedSource.asObservable();

  private createTransactionSource: Subject<boolean> = new Subject<boolean>();
  createTransaction: Observable<boolean> = this.createTransactionSource.asObservable();

  private ODCgeneratedSource: Subject<boolean> = new Subject<boolean>();
  ODCgenerated: Observable<boolean> = this.ODCgeneratedSource.asObservable();

  private Base64OdsSource: Subject<any> = new Subject<any>();
  Base64Ods:Observable<any> = this.Base64OdsSource.asObservable();

  private guaranteeSource: Subject<any> = new Subject<any>();
  guaranteeEntity: Observable<any> = this.guaranteeSource.asObservable();

  private endTransactionStorerSource: Subject<boolean> = new Subject<boolean>();
  endTransactionStorer: Observable<boolean> = this.endTransactionStorerSource.asObservable();

  public GetInterceptedSource(): Subject<any> {
    return this.requestInterceptedSource;
  }
  public CreateTransaction(): Subject<any> {
    return this.createTransactionSource;
  }

  public ODCGenerated(): Subject<boolean> {
    return this.ODCgeneratedSource;
  }

  public SetParametersGroup(parameter: Parameter): void {
    this.parameter = parameter;
  }

  public GetParametersGroup(): Parameter {
    return this.parameter;
  }
  public GetBase64FileToSend():Subject<any>{
    return this.Base64OdsSource;
  }
  public getGuaranteeEntity():Subject<any>{
    return this.guaranteeSource;
  }
  public EndTransactionStorer(): Subject<boolean> {
    return this.endTransactionStorerSource;
  }

  public AddCount(): void {
    this.count++;
  }

  public DelCount(): void {
    this.count--;
  }

  public GetCount(): number {
    return this.count;
  }

  public AddCountError(): void {
    this.countError++;
  }

  public DelCountError(): void {
    this.countError = 0;
  }

  public GetCountError(): number {
    return this.countError;
  }

  public set SetMessageError(messageError: string){
    this.messageError = messageError;
  }

  public get GetMessageError(): string {
    return this.messageError;
  }

  public set setImei(value: string){
    this.imeiStr = value
  }

  public get getImei(): string {
    return this.imeiStr
  }
}

