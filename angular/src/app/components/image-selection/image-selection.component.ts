import { Component, Signal, ViewChild, computed } from "@angular/core";
import { MatListModule, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { CanvasStore } from "../../services/stores/canvas.store.service";
import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";
import { CustomError } from "../../models/CustomError";

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
  Object = Object;
  images: Signal<Record<string, MatListOptionArgs[]>> = computed(() => {
    var groups: Record<string, MatListOptionArgs[]> = {};
    this.processedImageStore.processedImages().map((imageDisplayInfo) => {
      var matListOptionArgs = groups[imageDisplayInfo.group]
      if (matListOptionArgs === undefined) {
        groups[imageDisplayInfo.group] = [];
      }
      matListOptionArgs.push(this.convertToMatListOptionArgs(imageDisplayInfo));
    });
    return groups;
  });
  hasImages = computed(() => {
    return this.processedImageStore.processedImages().length > 0
  });

  @ViewChild(MatSelectionList, { static: true })
  imagesList: MatSelectionList | undefined;

  constructor(
    protected canvasService: CanvasStore,
    private processedImageStore: ProcessedImageStore,
  ) {}

  ngOnInit() {
    this.canvasService.onImageProcessed.subscribe(this.onImageProcessed.bind(this));
  }

  onSelectionChanged(selectionChange: MatSelectionListChange) {
    var selectedImage = selectionChange.source.selectedOptions.selected[0];
    var imageDisplayInfo = this.processedImageStore.processedImages().find((imageAndLabel) => imageAndLabel.displayLabel === selectedImage.value.name);
    if (imageDisplayInfo === undefined) {
      throw new CustomError("Image not found");
    }
    this.canvasService.displayedImage.set(imageDisplayInfo);
  }

  onImageProcessed(imageDisplayInfo: ImageDisplayInfo) {
    // FIXME: This doesn't work. idk how to manually set the MatSelectionList value
    // this.imagesList!.writeValue([imageDisplayInfo.displayLabel]);
  }

  convertToMatListOptionArgs(imageDisplayInfo: ImageDisplayInfo): MatListOptionArgs {
    return {
      name: imageDisplayInfo.displayLabel,
      value: imageDisplayInfo.image,
      disabled: imageDisplayInfo.image == null,
    }
  }
}
