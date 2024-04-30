import { Component } from "@angular/core";
import { KMeansFormService } from "../../services/stores/kmeans-form.service";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";
import { CentroidComponent } from "./centroid/centroid.component";
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
  }
}
