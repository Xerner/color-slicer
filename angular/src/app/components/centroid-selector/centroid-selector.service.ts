import { Injectable, computed, signal } from '@angular/core';
import { first } from 'rxjs';
import { Pixel } from '../../models/Pixel';
import { CanvasService } from '../../services/canvas.service';
import { KmeansImageService } from '../../services/kmeans-image.service';
import { ProcessedImageStore } from '../../services/stores/processed-image.store.service';

@Injectable({ providedIn: 'root' })
export class CentroidSelectorService {
  selectedCentroid = signal<Pixel | null>(null);
  
  constructor(
    private canvasService: CanvasService,
    private kmeansImageService: KmeansImageService,
    private processedImageStore: ProcessedImageStore,
  ) { }
  
  initializeInitialCentroids() {
    this.onCentroidCountChanged(this.processedImageStore.INITIAL_CENTROID_COUNT);
  }

  onCentroidCountChangedBound = this.onCentroidCountChanged.bind(this)
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

  onCentroidSelectedBound = this.onCentroidSelected.bind(this);
  onCentroidSelected(centroid: Pixel) {
    if (centroid == null) {
      return;
    }
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
}