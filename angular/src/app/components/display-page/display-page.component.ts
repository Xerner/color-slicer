import { Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DisplayCanvasComponent } from './display-canvas/display-canvas.component';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { AppService } from '../../services/app.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSliderModule } from '@angular/material/slider';
import { FileData } from '../../models/fileData';
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
    MatTabsModule,
    MatToolbarModule,
    MatSliderModule, 
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DisplayPageComponent {
  tabIndex = 0;
  rawImage = toSignal<FileData | null>(this.imageService.rawImage);
  hasRawImageData = computed<boolean>(() => {
    return this.rawImage() != null;
  });
  clusteredImage = toSignal<FileData | null>(this.imageService.clusteredImage);
  hasClusteredImageData = computed<boolean>(() => {
    return this.clusteredImage() != null;
  });
  sliderValue = computed<number>(() => {
    return this.sliderRawValue() * this.sliderMultiplier();
  });
  sliderRawValue = signal<number>(1);
  sliderMultiplier = signal<number>(1);

  constructor(
    protected appService: AppService,
    protected imageService: ImageService,
    protected fileService: FileService,
  ) {}

  ngOnInit() {
    this.imageService.rawImage.subscribe(this.onRawImageChanged.bind(this));
    this.appService.reset.subscribe(this.onReset.bind(this));
  }
  
  onRawImageChanged(imageData: FileData | null) {
    if (imageData == null) {
      this.tabIndex = 0;
    }
  }

  onRawImageCanvasContextReady(context: CanvasRenderingContext2D | null) {
    if (context == null) {
      return;
    }
    this.imageService.rawImageContext2D.next(context)
  }

  onTabChange(event: MatTabChangeEvent) {
    this.tabIndex = event.index;
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
