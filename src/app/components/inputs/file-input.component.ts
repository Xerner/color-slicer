import { Component, ElementRef, EventEmitter, Output, ViewChild, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { CanvasStore } from "../../services/stores/canvas.store.service";

/**
 * https://stackblitz.com/edit/angular-material-file-input-with-form-field?file=src%2Fapp%2Fapp.component.ts
 */
@Component({
  selector: "app-file-input",
  templateUrl: "./file-input.component.html",
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent implements ControlValueAccessor {
  label = input("Upload");
  icon = input("attach_file");
  disabled = signal<boolean>(false);
  fileName = new FormControl({ value: "", disabled: this.disabled() }, Validators.required);
  private onChange!: (file: File) => void;
  private onTouched!: () => void;
  
  @ViewChild('fileInput', { static: true }) 
  set fileInputRef(ref: ElementRef<HTMLInputElement>) {
    this.fileInput = ref.nativeElement;
  }
  fileInput!: HTMLInputElement;

  writeValue(file: File | null): void {
    if (file == null) {
      this.fileName.patchValue("");
      this.fileInput.value = "";
      return;
    }
    this.updateFile(file);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleFileInputChange(): void {
    var fileList = this.fileInput.files;
    if (!fileList || fileList.length == 0) {
      this.fileName.patchValue("");
      return;
    }
    var file = fileList[0];
    this.updateFile(file);
  }

  updateFile(file: File) {
    this.fileName.patchValue(file.name);
    this.onChange(file);
  }

  public onBlur(): void {
    this.onTouched();
  }

  handleClick(event: Event) {
    event.stopPropagation();
    this.fileInput.click();
  }
}
