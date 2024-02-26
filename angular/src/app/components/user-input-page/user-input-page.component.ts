import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';
import { ImageService } from '../../services/image.service';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-user-input-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FileInputComponent, MatButtonModule],
  templateUrl: './user-input-page.component.html',
})
export class UserInputPageComponent {
  file: File | null = null;
  bytes: Uint8Array | null = null;
  dataUrl: string | null = null;

  constructor(private imageService: ImageService, protected appService: AppService) { }

  handleFileChange(file: File): void {
    this.imageService.onImageFileSelected.next(file);
  }

  reset() {
    this.appService.reset.next();
  }
}
