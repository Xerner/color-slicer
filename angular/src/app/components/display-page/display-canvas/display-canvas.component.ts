import { Component, ElementRef, Output, ViewChild, computed, effect, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CenteredIconComponent } from '../../centered-icon/centered-icon.component';
import { CanvasService } from '../../../services/canvas.service';
import { BehaviorSubject } from 'rxjs';
import { FixedArray } from '../../../models/FixedArray';
import { CanvasStore } from '../../../services/stores/canvas.store.service';

@Component({
  selector: 'app-display-canvas',
  standalone: true,
  templateUrl: './display-canvas.component.html',
  host: {
    class: 'flex flex-col',
  },
  imports: [
    MatIconModule, 
    CenteredIconComponent,
  ],
})
export class DisplayCanvasComponent {
  size = computed<FixedArray<number, 2> | null>(() => {
    var image = this.canvasStore.displayedImage()?.image();
    if (image == null) {
      return null;
    }
    return [image.width, image.height];
  });
  scale = input<number>(1);
  hasImageData = computed<boolean>(() => {
    return this.canvasStore.displayedImage()?.image() != null;
  });

  onImageOrScaleUpdate = effect(() => {
    if (!this.hasImageData()) {
      return;
    }
    var image = this.canvasStore.displayedImage()?.image();
    this.redrawImage(image);
  });

  readonly SHOWN_CANVAS_CLASS = 'shadow-md';
  readonly HIDDEN_CLASS = 'invisible w-0 h-0';
  protected canvasClass = computed<string>(this.getCanvasClass.bind(this));

  @Output()
  context = new BehaviorSubject<CanvasRenderingContext2D | null>(null);

  @ViewChild('canvas') 
  set canvasRef(element: ElementRef<HTMLCanvasElement>) {
    if (element == undefined) { 
      return;
    }
    var context = element.nativeElement.getContext('2d', { willReadFrequently: true });
    if (context == null) {
      return;
    }
    this.context.next(context);
  }

  constructor(
    private canvasService: CanvasService,
    private canvasStore: CanvasStore,
  ) { }

  redrawImage(image: HTMLImageElement | null | undefined) {
    if (image == null || image == undefined) {
      return;
    }
    var context = this.context.getValue();
    if (context == null) {
      return;
    }
    var image = this.canvasStore.displayedImage()?.image();
    if (image == null) {
      return;
    }
    var imageScale = this.scale();
    context.scale(imageScale, imageScale);
    this.canvasService.drawImage(context, image);
  }

  protected getCanvasClass() {
    if (this.hasImageData()) {
      if  (this.canvasStore.areMouseEventsListening()) {
        return this.SHOWN_CANVAS_CLASS + ' cursor-crosshair';
      }
      return this.SHOWN_CANVAS_CLASS;
    }
    return this.HIDDEN_CLASS;
  }
}
