import { Component, computed, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { KMeansFormService } from "../../services/stores/kmeans-form.service";
import { Centroid } from "../../models/Centroid";
import { CanvasService } from "../../services/canvas.service";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";
import { KmeansImageService } from "../../services/kmeans-image.service";
import { Pixel } from "../../models/Pixel";
import { CanvasStore } from "../../services/stores/canvas.store.service";
import { first } from "rxjs";

@Component({
  selector: 'app-centroid-selector',
  standalone: true,
  templateUrl: './centroid-selector.component.html',
})
export class CentroidSelectorComponent {
  count = computed(() => {
    return this.processedImageStore.initialCentroids().length;
  })
  selectedCentroid = signal<Pixel | null>(null);
  displayedCentroids = computed<Pixel[]>(() => {
    var count = this.count();
    if (count == null) {
      return [];
    }
    return this.processedImageStore.initialCentroids().slice(0, count);
  });
  centroidStyles = computed<string[]>(() => {
    return this.processedImageStore.initialCentroids().map(pixel => {
      return this.getCentroidStyle(pixel);
    })
  })

  constructor(
    private kMeansFormService: KMeansFormService,
    private canvasService: CanvasService,
    private kmeansImageService: KmeansImageService,
    private processedImageStore: ProcessedImageStore,
  ) {}

  ngOnInit() {
    this.kMeansFormService.form.controls.clusters.valueChanges.subscribe(this.onCentroidCountChanged.bind(this));
    this.kMeansFormService.form.controls.clusters.setValue(this.kMeansFormService.form.controls.clusters.value);
    this.onCentroidCountChanged(this.kMeansFormService.form.controls.clusters.value);
  }

  onCentroidCountChanged(count: number | null) {
    if (count == null || count == this.processedImageStore.initialCentroids().length) {
      return;
    }
    if (count < this.processedImageStore.initialCentroids().length) {
      this.processedImageStore.initialCentroids.set(this.processedImageStore.initialCentroids().slice(0, count));
      return;
    }
    var newCentroidCount = count - this.processedImageStore.initialCentroids().length;
    var newRandomCentroids = this.kmeansImageService.getRandomInitialCentroids(newCentroidCount) as Pixel[];
    this.processedImageStore.initialCentroids.set([
      ...this.processedImageStore.initialCentroids(), 
      ...newRandomCentroids
    ]);
  }

  onCentroidSelected(centroid: Pixel) {
    if (this.selectedCentroid() == centroid) {
      this.selectedCentroid.set(null);
      this.canvasService.removeMouseClickListener();
      return;
    }
    this.selectedCentroid.set(centroid);
    this.canvasService.listenForMouseClick().pipe(first()).subscribe((mouseEvent) => {
      var pixel = this.canvasService.getPixelFromMouseEvent(mouseEvent);
      var index = this.processedImageStore.initialCentroids().indexOf(centroid);
      this.processedImageStore.initialCentroids().splice(index, 1, pixel);
      this.processedImageStore.initialCentroids.set([...this.processedImageStore.initialCentroids()]);
      // this.processedImageStore.initialCentroids.update((initialCentroids) => {
      //   initialCentroids.splice(index, 1, pixel);
      //   return initialCentroids;
      // });
      this.selectedCentroid.set(null);
      this.canvasService.removeMouseClickListener();
    });
  }

  getCentroidStyle(centroid: Pixel) {
    var color = this.canvasService.pixelToColor(centroid);
    return `background-color: ${color}; width: 32px; height: 32px;`
  }

  getCentroidClass(centroid: Pixel) {
    // var index = this.processedImageStore.initialCentroids().indexOf(centroid);
    if (centroid == this.selectedCentroid()) {
      return 'rounded border-2 border-rose-500'
    }
    return 'rounded border'
  }
}
