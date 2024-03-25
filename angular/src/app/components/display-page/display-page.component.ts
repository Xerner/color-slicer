import { Component, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DisplayCanvasComponent } from './display-canvas/display-canvas.component';
import { CanvasStore } from '../../services/stores/canvas.store.service';
import { FileService } from '../../services/file.service';
import { CanvasService } from '../../services/canvas.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-display-page',
  standalone: true,
  templateUrl: './display-page.component.html',
  styleUrls: ['./display-page.component.scss'],
  imports: [
    MatIconModule, 
    DisplayCanvasComponent, 
    MatToolbarModule,
    MatSliderModule, 
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DisplayPageComponent {
  hasImageData = computed<boolean>(() => {
    return this.canvasStore.displayedImage() != null;
  });
  sliderValue = computed<number>(() => {
    return this.canvasStore.sliderRawValue() * this.canvasStore.sliderMultiplier();
  });

  constructor(
    protected canvasStore: CanvasStore,
    protected canvasService: CanvasService,
    protected fileService: FileService,
  ) {}

  onRawImageCanvasContextReady(context: CanvasRenderingContext2D | null) {
    if (context == null) {
      return;
    }
    this.canvasStore.context2D.set(context)
    this.canvasStore.onContext2DReady.next();
  }

  protected onSliderChange(value: number) {
    this.canvasStore.sliderRawValue.set(value);
  }

  protected onSliderMultiplierChange(event: Event) {
    var value = (event.target as HTMLInputElement).value;
    this.canvasStore.sliderMultiplier.set(parseFloat(value));
  }

  protected onReset() {
    this.canvasStore.sliderRawValue.set(1);
    this.canvasStore.sliderMultiplier.set(1);
  }

  protected formatSliderLabel(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }
}
