import { Component, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../../services/app.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { FileService } from '../../services/file.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

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
  bytes: Uint8Array | null = null;
  dataUrl: string | null = null;

  fileForm = new FormGroup({
    file: new FormControl<File | null>(null, Validators.required),
  });
  kmeansForm = new FormGroup({
    clusters: new FormControl<number | null>(null, Validators.required),
    iterations: new FormControl<number>(10, Validators.required),
  });

  @ViewChild(MatStepper, { static: true }) stepper!: MatStepper;

  constructor(
    private appService: AppService,
    private fileService: FileService,
  ) { }

  ngOnInit() {
    this.appService.reset.subscribe(this.onReset.bind(this));
    this.fileForm.controls.file.valueChanges.subscribe(this.handleFileChange.bind(this));
  }

  handleFileChange(file: File | null): void {
    if (file == null) {
      return;
    }
    this.fileService.updateFileData(file);
  }

  reset() {
    this.stepper.reset();
    this.appService.reset.next();
  }

  onReset() {
    this.fileForm.reset();
  }
}
