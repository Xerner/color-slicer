import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [
    MatIconModule, 
    MatToolbarModule, 
    MatButtonModule,
  ],
  templateUrl: './app-bar.component.html'
})
export class AppBarComponent {
}
