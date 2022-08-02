export const environment = {
  production: true,
  urlRedirectTo: '',
  idODSTemplate: 221,
  idNonComplianceTemplate: 400,
  ic: 2, //Número de intentos (inciiando desde la posición 0) para consumo de ws por bad request
  header: 'transactionId=string&system=string&target=string&user=string&requestDate=' + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString() + '&ipApplication=string&traceabilityId=string',
  urlCrmUtils: 'https://miclaroasesor.claro.com.co:9443/CRMUtilServicesV1/api/{0}?{1}' // PROD
};
