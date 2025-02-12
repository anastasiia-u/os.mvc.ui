import * as am5 from '@amcharts/amcharts5';
import { Component } from '@angular/core';
import { environment } from '@env/environment';

am5.addLicense(environment.amcharts5LicenseKey);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Media-Vitals-HCP';
}
