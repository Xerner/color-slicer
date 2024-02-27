import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../../services/app.service';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-user-input-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FileInputComponent, MatButtonModule, MatSliderModule],
  templateUrl: './user-input-page.component.html',
})
export class UserInputPageComponent {
  get fileData() {
    return this.appService.fileData();
  }
  file: File | null = null;
  bytes: Uint8Array | null = null;
  dataUrl: string | null = null;

  constructor(private appService: AppService) { }

  handleFileChange(file: File): void {
    this.appService.updateFileData(file);
  }

  reset() {
    this.appService.reset.next();
  }
}
