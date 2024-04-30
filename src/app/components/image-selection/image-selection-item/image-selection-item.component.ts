import { Component, computed, input } from "@angular/core";
import { MatListModule, MatSelectionList } from "@angular/material/list";
import { ImageDisplayInfo } from "../../../models/ImageDisplayInfo";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-image-selection-item",
  templateUrl: "./image-selection-item.component.html",
  standalone: true,
  imports: [
    MatListModule,
    MatSelectionList,
    MatProgressSpinnerModule,
  ],
})
export class ImageSelectionItemComponent {
  imageDisplayInfo = input.required<ImageDisplayInfo>();
  protected disabled = computed(() => {
    return this.imageDisplayInfo().image() == null;
  })
  displayLabel = computed(() => {
    var disabled = this.disabled();
    if (disabled) {
      return this.imageDisplayInfo().displayLabel + " (Empty)";
    }
    return this.imageDisplayInfo().displayLabel;
  })
}
