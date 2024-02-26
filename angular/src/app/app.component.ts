import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBarComponent } from './components/app-bar/app-bar.component';
import { AppContentComponent } from './components/app-content/app-content.component';
import { UserInputPageComponent } from './components/user-input-page/user-input-page.component';
import { DisplayPageComponent } from './components/display-page/display-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppBarComponent, AppContentComponent, UserInputPageComponent, DisplayPageComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'meshgen';
}
