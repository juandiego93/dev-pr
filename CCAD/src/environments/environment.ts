export const environment = {
  production: false,
  versionApp: '1.8',
  idTemplateCertCuent: 181,
  busV: 'V2.0',
  header: 'transactionId=string&system=string&target=string&user=string&requestDate=' + new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString() + '&ipApplication=string&traceabilityId=string',
  urlCrmUtils: 'http://100.126.19.9:8300/CRMUtilServicesv1/api/{0}?{1}' // RELEASE-DEVELOP
};
