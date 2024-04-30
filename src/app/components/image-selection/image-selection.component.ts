import { Component, Signal, ViewChild, computed } from "@angular/core";
import { MatListModule, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { CanvasStore } from "../../services/stores/canvas.store.service";
import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";
import { CustomError } from "../../models/CustomError";
import { ImageSelectionItemComponent } from "./image-selection-item/image-selection-item.component";

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
    ImageSelectionItemComponent,
  ],
})
export class ImageSelectionComponent {
  Object = Object;
  images: Signal<Record<string, ImageDisplayInfo[]>> = computed(() => {
    var groups: Record<string, ImageDisplayInfo[]> = {};
    this.processedImageStore.processedImages().map((imageDisplayInfo) => {
      this.addToImageDisplayGroup(imageDisplayInfo, groups);
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

  onSelectionChanged(selectionChange: MatSelectionListChange) {
    var selectedImageDisplayInfo = selectionChange.source.selectedOptions.selected[0].value;
    this.canvasService.displayedImage.set(selectedImageDisplayInfo);
  }

  addToImageDisplayGroup(imageDisplayInfo: ImageDisplayInfo, groups: Record<string, ImageDisplayInfo[]>) {
    var imageDisplayInfos = groups[imageDisplayInfo.group]
    if (imageDisplayInfos === undefined) {
      imageDisplayInfos = [];
      groups[imageDisplayInfo.group] = imageDisplayInfos;
    }
    imageDisplayInfos.push(imageDisplayInfo);

  }
}
