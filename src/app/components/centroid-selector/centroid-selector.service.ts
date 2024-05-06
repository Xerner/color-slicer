import { Injectable, signal } from '@angular/core';
import { first } from 'rxjs';
import { Pixel } from '../../models/Pixel';
import { CanvasService } from '../../services/canvas.service';
import { IGNORE_PIXEL, KmeansImageService } from '../../services/kmeans-image.service';
import { ProcessedImageStore } from '../../services/stores/processed-image.store.service';
import { Vector } from '../../models/Vector';

@Injectable({ providedIn: 'root' })
export class CentroidSelectorService {
  selectedCentroidIndex = signal<number | null>(null);
  prevCentroidPixel = signal<Pixel | null>(new Pixel(0, 0, 0));

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
    var newRandomCentroids = this.kmeansImageService.getRandomInitialCentroids(newCentroidCount, IGNORE_PIXEL) as Pixel[];
    var centroidSignals = newRandomCentroids.map((centroid) => signal(centroid));
    this.processedImageStore.initialCentroids.set([
      ...this.processedImageStore.initialCentroids(),
      ...centroidSignals
    ]);
  }

  onCentroidSelectedBound = this.onCentroidSelected.bind(this);
  onCentroidSelected(newIndex: number) {
    this.canvasService.removeMouseEventListener();
    this.restorePreviousCentroid();
    var selectedCentroid = this.processedImageStore.initialCentroids()[newIndex]();
    if (this.selectedCentroidIndex() == newIndex) {
      this.selectedCentroidIndex.set(null);
      return;
    }
    this.selectedCentroidIndex.set(newIndex);
    this.prevCentroidPixel.set(selectedCentroid);
    this.selectedCentroidIndex.set(newIndex);
    var { clickEvent, mouseMoveEvent } = this.canvasService.listenForMouseEvents();
    clickEvent.pipe(first()).subscribe(this.onMouseClick.bind(this, newIndex));
    mouseMoveEvent.subscribe(this.onMouseMove.bind(this, newIndex));
  }

  restorePreviousCentroid() {
    var prevCentroidIndex = this.selectedCentroidIndex();
    if (prevCentroidIndex == null) {
      return;
    }
    var centroid = this.processedImageStore.initialCentroids()[prevCentroidIndex];
    var prevCentroidColor = this.prevCentroidPixel();
    if (prevCentroidColor == null) {
      return;
    }
    centroid.set(prevCentroidColor);
  }

  onMouseClick(selectedCentroidIndex: number, mouseEvent: MouseEvent) {
    var selectedPixel = this.canvasService.getPixelFromMouseEvent(mouseEvent);
    if (selectedPixel == null || selectedPixel == undefined) {
      return;
    }
    var centroid = this.processedImageStore.initialCentroids()[selectedCentroidIndex];
    centroid?.set(selectedPixel)
    this.selectedCentroidIndex.set(null);
    this.prevCentroidPixel.set(null);
    this.canvasService.removeMouseEventListener();
  }

  onMouseMove(selectedCentroidIndex: number, mouseEvent: MouseEvent) {
    var hoveredPixel = this.canvasService.getPixelFromMouseEvent(mouseEvent);
    if (hoveredPixel == null || hoveredPixel == undefined) {
      return;
    }
    var selectedCentroid = this.processedImageStore.initialCentroids()[selectedCentroidIndex];
    if (selectedCentroid == undefined || selectedCentroid == null) {
      return;
    }
    selectedCentroid.set(hoveredPixel);
  }
}