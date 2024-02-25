import { Component, Input, VERSION } from "@angular/core";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

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
  name = "Angular " + VERSION.major;
  display = new FormControl("", Validators.required);
  fileList: FileList | null = null;
  filePaths: Array<string> = [];

  handleFileInputChange(fileList: FileList | null): void {
    if (!fileList) {
      return;
    }
    this.fileList = fileList;
    if (fileList.length) {
      const f = fileList[0];
      const count = fileList.length > 1 ? `(+${fileList.length - 1} files)` : "";
      this.display.patchValue(`${f.name}${count}`);
    } else {
      this.display.patchValue("");
    }
  }

  handleSubmit(): void {
    if (!this.fileList) {
      return;
    }
    var fd = new FormData();
    this.filePaths = [];
    for (let i = 0; i < this.fileList.length; i++) {
      fd.append("files", this.fileList[i], this.fileList[i].name);
      this.filePaths.push(this.fileList[i].name);
    }

    // do submit ajax
  }
}
