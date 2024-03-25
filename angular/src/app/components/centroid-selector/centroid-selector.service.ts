import { Injectable, signal } from '@angular/core';
import { first } from 'rxjs';
import { Pixel } from '../../models/Pixel';
import { CanvasService } from '../../services/canvas.service';
import { KmeansImageService } from '../../services/kmeans-image.service';
import { ProcessedImageStore } from '../../services/stores/processed-image.store.service';

@Injectable({ providedIn: 'root' })
export class CentroidSelectorService {
  selectedCentroid = signal<number | null>(null);
  prevCentroidPixel = signal<Pixel>(new Pixel(0, 0, 0, 0));

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
    var centroidSignals = newRandomCentroids.map((centroid) => signal(centroid));
    this.processedImageStore.initialCentroids.set([
      ...this.processedImageStore.initialCentroids(),
      ...centroidSignals
    ]);
  }

  onCentroidSelectedBound = this.onCentroidSelected.bind(this);
  onCentroidSelected(selectedCentroidIndex: number) {
    var selectedCentroid = this.processedImageStore.initialCentroids()[selectedCentroidIndex]();
    if (this.selectedCentroid() == selectedCentroidIndex) {
      this.prevCentroidPixel.set(selectedCentroid);
      this.selectedCentroid.set(null);
      this.canvasService.removeMouseEventListener();
      return;
    }
    this.selectedCentroid.set(selectedCentroidIndex);
    var { clickEvent, mouseMoveEvent } = this.canvasService.listenForMouseEvents();
    clickEvent.pipe(first()).subscribe(this.onMouseClick.bind(this, selectedCentroidIndex));
    mouseMoveEvent.subscribe(this.onMouseMove.bind(this, selectedCentroidIndex));
  }

  onMouseClick(selectedCentroidIndex: number, mouseEvent: MouseEvent) {
    var selectedPixel = this.canvasService.getPixelFromMouseEvent(mouseEvent);
    if (selectedPixel == null || selectedPixel == undefined) {
      return;
    }
    var centroid = this.processedImageStore.initialCentroids()[selectedCentroidIndex];
    centroid?.set(selectedPixel)
    this.selectedCentroid.set(null);
    this.canvasService.removeMouseEventListener();
  }

  onMouseMove(selectedCentroidIndex: number, mouseEvent: MouseEvent) {
    var hoveredPixel = this.canvasService.getPixelFromMouseEvent(mouseEvent);
    if (hoveredPixel == null || hoveredPixel == undefined) {
      return;
    }
    var centroid = this.processedImageStore.initialCentroids()[selectedCentroidIndex];
    if (centroid == undefined || centroid == null) {
      return;
    }
    centroid.set(hoveredPixel);
  }
}