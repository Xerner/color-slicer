import { Component, ViewChild } from '@angular/core';
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
  ],
  // providers: [
  //   {
  //     provide: STEPPER_GLOBAL_OPTIONS,
  //     useValue: { showError: true }
  //   }
  // ],
  templateUrl: './user-input-page.component.html',
})
export class UserInputPageComponent {
  fileForm = new FormGroup({
    file: new FormControl<File | null>(null, Validators.required),
  });

  // @ViewChild(MatStepper, { static: true }) 
  // stepper!: MatStepper;

  constructor(
    private canvasStore: CanvasStore,
    private processedImageStore: ProcessedImageStore,
    private fileService: FileService,
    private kmeansImageService: KmeansImageService,
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
    this.canvasStore.reset();
    this.processedImageStore.reset();
    // this.stepper.reset();
    this.kmeansForm.form.controls.iterations.setValue(10);
  }

  isReadyForKmeans() {
    return this.kmeansForm.form.valid;
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
