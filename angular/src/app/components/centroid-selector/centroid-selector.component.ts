import { Component, computed, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FixedArray } from "../../models/FixedArray";
import { KMeansFormService } from "../../services/stores/kmeans-form.service";

@Component({
  selector: 'app-centroid-selector',
  standalone: true,
  templateUrl: './centroid-selector.component.html',
})
export class CentroidSelectorComponent {
  count = signal<number>(1);
  displayedCentroids = computed<FixedArray<number, 2>[]>(() => {
    return this.centroids().slice(0, this.count());
  });
  centroids = signal<FixedArray<number, 2>[]>([]);

  constructor(
    private kMeansFormService: KMeansFormService,
  ) {}

  ngOnInit() {
    this.kMeansFormService.form.controls.clusters.valueChanges.subscribe((count) => {
      this.updateCentroids(count);
    });
    this.updateCentroids(this.kMeansFormService.form.controls.clusters.value);
  }

  updateCentroids(count: number | null) {
    if (count == null) {
      return;
    }
    this.count.set(count);
    if (count > this.centroids().length) {
      this.centroids.set([...this.centroids(), ...Array(count - this.centroids().length).fill([0, 0])]);
    }
  }
}
