import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-redirect',
  templateUrl: './external-redirect-flow.component.html'
})
export class ExternalRedirectFlowComponent implements OnInit{
  public endPoint: string;
  public postData:string

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.endPoint  = params['endPoint'];
      this.postData  = params['postData'];
      });
  }


  private SendMessage(): void {
    var iframe = document.getElementById('frameRedirect');
    if (iframe == null) return;
    var iWindow = (<HTMLIFrameElement>iframe).contentWindow;

    iWindow.postMessage(this.postData, '*');
  }

  public LoadEvent(): void {
    this.SendMessage();
  }


}
