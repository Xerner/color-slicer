import { Component, ViewChild, computed } from "@angular/core";
import { MatListModule, MatListOption, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { AppStoreService } from "../../services/app.store.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { SelectionModel } from "@angular/cdk/collections";

export interface MatListOptionArgs {
  name: string;
  value: HTMLImageElement | null;
  disabled: boolean;
}

@Component({
  selector: "app-image-selection",
  templateUrl: "./image-selection.component.html",
  standalone: true,
  imports: [
    MatSelectionList,
    MatListModule,
  ],
})
export class ImageSelectionComponent {
  images = computed<MatListOptionArgs[]>(() => {
    var images = this.storeService.images();
    var matListOptions = images.map((imageAndLabel) => {
      return { name: imageAndLabel.label, value: imageAndLabel.image, disabled: imageAndLabel.image == null }
    })
    return matListOptions;
  });
  @ViewChild(MatSelectionList, { static: true })
  imagesList: MatSelectionList | undefined;

  constructor(
    protected storeService: AppStoreService,
  ) {}

  onSelectionChanged(selectionChange: MatSelectionListChange) {
    var selectedImage = selectionChange.source.selectedOptions.selected[0];
    var image = selectedImage.value;
    this.storeService.displayedImage.set(image.value);
  }
}
