import { Component, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DisplayCanvasComponent } from './display-canvas/display-canvas.component';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { AppService } from '../../services/app.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSliderModule } from '@angular/material/slider';
import { FileData } from '../../models/fileData';

@Component({
  selector: 'app-display-page',
  standalone: true,
  templateUrl: './display-page.component.html',
  imports: [
    MatIconModule, 
    DisplayCanvasComponent, 
    MatTabsModule,
  ],
})
export class DisplayPageComponent {
  tabIndex = 0;
  rawImage = toSignal<FileData | null>(this.imageService.rawImage);
  hasRawImageData = computed<boolean>(() => {
    return this.rawImage() != null;
  });

  constructor(
    protected appService: AppService,
    protected imageService: ImageService,
    protected fileService: FileService,
  ) {}

  ngOnInit() {
    this.imageService.rawImage.subscribe(this.onRawImageChanged.bind(this));
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
}
