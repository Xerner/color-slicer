import { Component, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AppStoreService } from '../../services/app.store.service';
import { MatDividerModule } from '@angular/material/divider';
import { FileService } from '../../services/file.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { KmeansService } from '../../services/kmeans.service';
import { ImageService } from '../../services/image.service';
import { KmeansImageService } from '../../services/kmeans-image.service';

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
  kmeansForm = new FormGroup({
    clusters: new FormControl<number | null>(null, Validators.required),
    iterations: new FormControl<number>(10, Validators.required),
  });

  @ViewChild(MatStepper, { static: true }) stepper!: MatStepper;

  constructor(
    private storeService: AppStoreService,
    private fileService: FileService,
    private kmeansImageService: KmeansImageService,
  ) { }

  ngOnInit() {
    this.storeService.reset.subscribe(this.onReset.bind(this));
    this.fileForm.controls.file.valueChanges.subscribe(this.handleFileChange.bind(this));
  }

  handleFileChange(file: File | null): void {
    if (file == null) {
      return;
    }
    this.fileService.updateFileData(file);
  }

  reset() {
    this.storeService.reset.next();
  }

  onReset() {
    this.stepper.reset();
    this.kmeansForm.controls.iterations.setValue(10);
  }

  isReadyForKmeans() {
    return this.kmeansForm.valid;
  }

  generateKmeansImages() {
    var rawImageData = this.storeService.rawImageData()
    if (rawImageData == null) {
      throw new Error("No image file")
    }
    var clusters = this.kmeansForm.controls.clusters.value
    if (clusters == null) {
      throw new Error("No clusters")
    }
    var iterations = this.kmeansForm.controls.iterations.value
    if (iterations == null) {
      throw new Error("No iterations")
    }
    this.kmeansImageService.generateKmeansImages(rawImageData, clusters, iterations, 0);
  }
}
