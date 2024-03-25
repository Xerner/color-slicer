import { Component, computed, input } from "@angular/core";
import { CanvasService } from "../../services/canvas.service";
import { Pixel } from "../../models/Pixel";

@Component({
  selector: 'app-centroid',
  standalone: true,
  templateUrl: './centroid.component.html',
})
export class CentroidComponent {
  index = input.required<number>();
  centroid = input.required<Pixel>();
  isSelected = input.required<boolean>();
  onSelected = input.required<((index: number) => void)>();
  centroidStyle = computed<string>(() => {
    return this.getCentroidStyle(this.centroid());
  });

  constructor(
    private canvasService: CanvasService,
  ) {}

  getCentroidStyle(centroid: Pixel) {
    var color = this.canvasService.pixelToColor(centroid);
    return `background-color: ${color}; width: 32px; height: 32px;`
  }

  getCentroidClass() {
    if (this.isSelected()) {
      return 'rounded border-2 border-rose-500'
    }
    return 'rounded border'
  }
}
