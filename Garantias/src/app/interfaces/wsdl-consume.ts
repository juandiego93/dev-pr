import * as xml2js from 'xml2js';
export class WsdlConsume {
  private jsonObj: string;
  private xmlStr: string;
  public convertJson(xmlRequest: string): string {
    const parseString = xml2js.parseString;
    let data: any;
    parseString(xmlRequest, function(err, result) {
      data = result;
    });
    this.jsonObj = data;
    return this.jsonObj;
  }

  public convertXml(jsonRequest): string {
    const builder = new xml2js.Builder();
    const data = builder.buildObject(jsonRequest);
    this.xmlStr = data;
    return this.xmlStr;
  }

}
