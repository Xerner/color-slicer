import { Component, ElementRef, EventEmitter, Input, Output, VERSION, ViewChild } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Event } from "@angular/router";
import { AppService } from "../../services/app.service";

/**
 * https://stackblitz.com/edit/angular-material-file-input-with-form-field?file=src%2Fapp%2Fapp.component.ts
 */
@Component({
  selector: "app-file-input",
  templateUrl: "./file-input.component.html",
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
})
export class FileInputComponent {
  @Input() label = "Upload";
  @Input() icon = "attach_file";
  @Output('fileChange') fileChange = new EventEmitter<File>();
  display = new FormControl("", Validators.required);

  @ViewChild('fileInput', { static: true }) set fileInputRef(ref: ElementRef<HTMLInputElement>) {
    this.fileInput = ref.nativeElement;
  }
  fileInput!: HTMLInputElement;

  constructor(private appService: AppService) { }

  ngOnInit() {
    this.appService.reset.subscribe(this.reset.bind(this));
  }

  handleFileInputChange(): void {
    var fileList = this.fileInput.files;
    if (!fileList || fileList.length == 0) {
      this.display.patchValue("");
      return;
    }
    var file = fileList[0];
    this.display.patchValue(file.name);
    this.fileChange.emit(file);
  }

  reset() {
    this.display.patchValue("");
    this.fileInput.value = "";
  }
}
