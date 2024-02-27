import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DisplayCanvasComponent } from './display-image/display-canvas.component';

@Component({
  selector: 'app-display-page',
  standalone: true,
  templateUrl: './display-page.component.html',
  imports: [MatIconModule, DisplayCanvasComponent],
})
export class DisplayPageComponent {
}
