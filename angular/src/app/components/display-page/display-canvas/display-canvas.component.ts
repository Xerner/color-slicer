import { Component, ElementRef, EventEmitter, Output, ViewChild, computed, effect, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CenteredIconComponent } from '../../centered-icon/centered-icon.component';
import { ImageService } from '../../../services/image.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppService } from '../../../services/app.service';
import { BehaviorSubject } from 'rxjs';
import { FileData } from '../../../models/fileData';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-display-canvas',
  standalone: true,
  templateUrl: './display-canvas.component.html',
  styleUrls: ['./display-canvas.component.scss'],
  host: {
    class: 'h-full flex flex-col',
  },
  imports: [
    MatIconModule, 
    CenteredIconComponent,
    MatToolbarModule,
    MatSliderModule, 
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DisplayCanvasComponent {
  imageData = input<FileData | null>();
  sliderValue = computed<number>(() => {
    return this.sliderRawValue() * this.sliderMultiplier();
  });
  sliderRawValue = signal<number>(1);
  sliderMultiplier = signal<number>(1);
  protected hasImageData = computed<boolean>(() => {
    return this.imageData() != null;
  });

  onSliderValueChange = effect(() => {
    if (!this.hasImageData()) {
      return;
    }
    var sliderValue = this.sliderValue();
    var context = this.context.getValue()!;
    context.scale(sliderValue, sliderValue);
    this.redrawImage();
  })

  onImageDataUpdate = effect(this.redrawImage.bind(this));

  readonly SHOWN_CANVAS_CLASS = 'shadow-md';
  readonly HIDDEN_CLASS = 'invisible w-0 h-0';
  protected canvasClass = computed<string>(this.getCanvasClass.bind(this));

  @Output()
  context = new BehaviorSubject<CanvasRenderingContext2D | null>(null);
  _context!: CanvasRenderingContext2D;

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
    private appService: AppService,
  ) { }

  ngOnInit() {
    this.appService.reset.subscribe(this.onReset.bind(this));
  }

  redrawImage() {
    var context = this.context.getValue();
    if (context == null) {
      return;
    }
    var imageData = this.imageData();
    if (imageData == null) {
      return;
    }
    this.imageService.drawImage(context, imageData);
  }

  protected getCanvasClass() {
    if (this.hasImageData()) {
      return this.SHOWN_CANVAS_CLASS;
    }
    return this.HIDDEN_CLASS;
  }

  protected formatSliderLabel(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }

  protected onSliderChange(value: number) {
    this.sliderRawValue.set(value);
  }

  protected onSliderMultiplierChange(event: Event) {
    var value = (event.target as HTMLInputElement).value;
    this.sliderMultiplier.set(parseInt(value));
  }

  protected onReset() {
    this.sliderRawValue.set(1);
    this.sliderMultiplier.set(1);
  }
}
