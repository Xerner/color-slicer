import { Component, ViewChild, computed } from "@angular/core";
import { MatListModule, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { CanvasStore } from "../../services/stores/canvas.store.service";
import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";

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
  fullImages = computed<MatListOptionArgs[]>(() => {
    return this.convertToMatListOptionArgs(this.processedImageStore.fullImages());
  });
  colorLayers = computed<MatListOptionArgs[]>(() => {
    return this.convertToMatListOptionArgs(this.processedImageStore.colorLayersImages());
  });
  hasImages = computed(() => {
    return this.processedImageStore.colorLayersImages().length > 0
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
    var imageDisplayInfo = this.processedImageStore.allImages.find((imageAndLabel) => imageAndLabel.displayLabel === selectedImage.value.name);
    if (imageDisplayInfo === undefined) {
      throw new Error("Image not found");
    }
    this.canvasService.displayedImage.set(imageDisplayInfo);
  }

  onImageProcessed(imageDisplayInfo: ImageDisplayInfo) {
    // FIXME: This doesn't work. idk how to manually set the MatSelectionList value
    // this.imagesList!.writeValue([imageDisplayInfo.displayLabel]);
  }

  convertToMatListOptionArgs(imageDisplayInfos: ImageDisplayInfo[]): MatListOptionArgs[] {
    return imageDisplayInfos.map((imageDisplayInfo) => {
      return {
        name: imageDisplayInfo.displayLabel,
        value: imageDisplayInfo.image,
        disabled: imageDisplayInfo.image == null,
      }
    });
  }
}
