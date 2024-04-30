import { Component, computed, input } from "@angular/core";
import { CanvasService } from "../../../services/canvas.service";
import { Pixel } from "../../../models/Pixel";

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
  textClass = computed<string>(() => {
    return this.isSelected() ? 'text-white bg-blue-500 px-1 rounded-md' : '';
  })

  constructor(
    private canvasService: CanvasService,
  ) {}

  getCentroidStyle(centroid: Pixel) {
    var color = this.canvasService.pixelToColor(centroid);
    return `background-color: ${color};`
  }

  getCentroidClass() {
    if (this.isSelected()) {
      return 'border-4 border-blue-500'
    }
    return ''
  }
}
