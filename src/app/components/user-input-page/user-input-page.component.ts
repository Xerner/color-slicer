import { Component, ViewChild, computed } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';
import { CanvasStore } from '../../services/stores/canvas.store.service';
import { MatDividerModule } from '@angular/material/divider';
import { FileService } from '../../services/file.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { KmeansImageService } from '../../services/kmeans-image.service';
import { LoadingBarComponent } from '../loading-bar/loading-bar.component';
import { ProcessedImageStore } from '../../services/stores/processed-image.store.service';
import { KMeansFormService } from '../../services/stores/kmeans-form.service';
import { CustomError } from '../../models/CustomError';
import { CentroidSelectorComponent } from '../centroid-selector/centroid-selector.component';
import { CanvasService } from '../../services/canvas.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingStore } from '../../services/stores/loading.store.service';
import { StatisticsComponent } from '../statistics/statistics.component';

@Component({
  selector: 'app-user-input-page',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FileInputComponent, 
    MatButtonModule, 
    MatDividerModule,
    MatStepperModule,
    ReactiveFormsModule,
    LoadingBarComponent,
    CentroidSelectorComponent,
    MatIconModule,
    MatTooltipModule,
    StatisticsComponent
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ],
  templateUrl: './user-input-page.component.html',
})
export class UserInputPageComponent {
  fileForm = new FormGroup({
    file: new FormControl<File | null>(null, Validators.required),
  });

  isReadyForKmeans = computed(() => {
    return !this.loadingStore.isLoading() && this.kmeansForm.form.valid;
  })

  @ViewChild(MatStepper, { static: true }) 
  stepper!: MatStepper;

  constructor(
    private canvasService: CanvasService,
    private canvasStore: CanvasStore,
    private processedImageStore: ProcessedImageStore,
    private fileService: FileService,
    private kmeansImageService: KmeansImageService,
    protected loadingStore: LoadingStore,
    protected kmeansForm: KMeansFormService,
  ) { }

  ngOnInit() {
    this.fileForm.controls.file.valueChanges.subscribe(this.handleFileChange.bind(this));
  }

  handleFileChange(file: File | null): void {
    if (file == null) {
      return;
    }
    this.fileService.updateFileData(file);
  }

  reset() {
    this.canvasService.reset();
    this.processedImageStore.reset();
    this.handleReset();
  }

  handleReset() {
    this.stepper.reset();
    this.fileForm.reset();
    this.loadingStore.reset()
    this.kmeansImageService.reset()
    this.kmeansForm.form.controls.clusters.setValue(4);
    this.kmeansForm.form.controls.iterations.setValue(10);
  }

  generateKmeansImages() {
    var rawImageData = this.canvasStore.rawImage()
    if (rawImageData == null) {
      throw new CustomError("No image file")
    }
    var clusters = this.kmeansForm.form.controls.clusters.value
    if (clusters == null) {
      throw new CustomError("No clusters")
    }
    var iterations = this.kmeansForm.form.controls.iterations.value
    if (iterations == null) {
      throw new CustomError("No iterations")
    }
    this.kmeansImageService.generateKmeansImages(rawImageData, clusters, iterations, null);
  }
}
