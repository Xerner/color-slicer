import { Component, Self } from "@angular/core";
import { KMeansFormService } from "../../services/stores/kmeans-form.service";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";
import { first } from "rxjs";
import { CentroidComponent } from "./centroid.component";
import { CanvasStore } from "../../services/stores/canvas.store.service";
import { CentroidSelectorService } from "./centroid-selector.service";

@Component({
  selector: 'app-centroid-selector',
  standalone: true,
  templateUrl: './centroid-selector.component.html',
  imports: [
    CentroidComponent,
  ],
})
export class CentroidSelectorComponent {
  constructor(
    protected centroidSelectorService: CentroidSelectorService,
    private kMeansFormService: KMeansFormService,
    protected processedImageStore: ProcessedImageStore,
  ) { }

  ngOnInit() {
    this.kMeansFormService.form.controls.clusters.valueChanges.subscribe(this.centroidSelectorService.onCentroidCountChangedBound);
    // this.canvasStore.onImageLoaded.subscribe(() => {
    //   // this.canvasStore.onImageDrawn.pipe(first()).subscribe(() => {
    //   //   this.centroidSelectorService.onCentroidCountChanged(this.processedImageStore.INITIAL_CENTROID_COUNT);
    //   // })
    // });
  }
}
