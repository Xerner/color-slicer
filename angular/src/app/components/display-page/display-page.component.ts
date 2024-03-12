import { Component, computed, signal } from '@angular/core';
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
  displayedImage = computed(() => {
    var displayedImage = this.storeService.displayedImage();
    if (displayedImage == null) {
      return null;
    }
    return displayedImage.image;
  });
  hasImageData = computed<boolean>(() => {
    return this.displayedImage() != null;
  });
  sliderValue = computed<number>(() => {
    return this.sliderRawValue() * this.sliderMultiplier();
  });
  sliderRawValue = signal<number>(1);
  sliderMultiplier = signal<number>(1);

  constructor(
    protected storeService: CanvasStore,
    protected imageService: CanvasService,
    protected fileService: FileService,
  ) {}

  ngOnInit() {
    this.storeService.reset.subscribe(this.onReset.bind(this));
  }

  onRawImageCanvasContextReady(context: CanvasRenderingContext2D | null) {
    if (context == null) {
      return;
    }
    this.storeService.context2D.set(context)
    this.storeService.onContext2DReady.next();
  }

  protected onSliderChange(value: number) {
    this.sliderRawValue.set(value);
  }

  protected onSliderMultiplierChange(event: Event) {
    var value = (event.target as HTMLInputElement).value;
    this.sliderMultiplier.set(parseFloat(value));
  }

  protected onReset() {
    this.sliderRawValue.set(1);
    this.sliderMultiplier.set(1);
  }

  protected formatSliderLabel(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }
}
