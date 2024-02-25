import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './app-bar.component.html'
})
export class AppBarComponent {
}
