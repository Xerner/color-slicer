import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBarComponent } from './components/app-bar/app-bar.component';
import { AppContentComponent } from './components/app-content/app-content.component';
import { UserInputPageComponent } from './components/user-input-page/user-input-page.component';
import { DisplayPageComponent } from './components/display-page/display-page.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageSelectionComponent } from './components/image-selection/image-selection.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    AppBarComponent, 
    AppContentComponent, 
    UserInputPageComponent, 
    DisplayPageComponent, 
    MatIconModule, 
    ImageSelectionComponent,
  ],
  host: {
    class: "block h-screen flex flex-col"
  },
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/svg/github.svg`)
    );
  }
}
