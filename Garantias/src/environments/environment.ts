// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  urlRedirectTo: '',
  idODSTemplate: 221,
  idNonComplianceTemplate: 400,
  ic: 2, //Número de intentos (inciiando desde la posición 0) para consumo de ws por bad request
  header: 'transactionId=string&system=string&target=string&user=string&requestDate=' + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString() + '&ipApplication=string&traceabilityId=string',
  urlCrmUtils: 'http://100.126.19.9:8300/CRMUtilServicesv1/api/{0}?{1}' // DEV-QA
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
