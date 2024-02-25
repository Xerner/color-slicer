import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FileInputComponent } from '../inputs/file-input.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-input-page',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FileInputComponent, MatButtonModule],
  templateUrl: './user-input-page.component.html',
})
export class UserInputPageComponent {
}
