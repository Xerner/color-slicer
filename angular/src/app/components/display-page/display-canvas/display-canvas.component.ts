import { Component, ElementRef, Output, ViewChild, computed, effect, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CenteredIconComponent } from '../../centered-icon/centered-icon.component';
import { ImageService } from '../../../services/image.service';
import { BehaviorSubject } from 'rxjs';
import { FixedArray } from '../../../models/fixed-array';

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
  image = input<HTMLImageElement | null>();
  size = computed<FixedArray<number, 2> | null>(() => {
    var image = this.image();
    if (image == null) {
      return null;
    }
    return [image.width, image.height];
  });
  scale = input<number>(1);
  protected hasImageData = computed<boolean>(() => {
    return this.image() != null;
  });

  onImageOrScaleUpdate = effect(() => {
    if (!this.hasImageData()) {
      return;
    }
    this.redrawImage();
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
    var context = element.nativeElement.getContext('2d');
    if (context == null) {
      return;
    }
    this.context.next(context);
  }

  constructor(
    private imageService: ImageService,
  ) { }

  redrawImage() {
    var context = this.context.getValue();
    if (context == null) {
      return;
    }
    var image = this.image();
    if (image == null) {
      return;
    }
    var imageScale = this.scale();
    context.scale(imageScale, imageScale);
    this.imageService.drawImage(context, image);
  }

  protected getCanvasClass() {
    if (this.hasImageData()) {
      return this.SHOWN_CANVAS_CLASS;
    }
    return this.HIDDEN_CLASS;
  }
}
