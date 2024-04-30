import { Component } from "@angular/core";
import { LoadingStore } from "../../services/stores/loading.store.service";
import { ProcessedImageStore } from "../../services/stores/processed-image.store.service";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.component.html",
  standalone: true,
  imports: [
  ],
})
export class StatisticsComponent {
  constructor(
    protected loadingStore: LoadingStore,
    protected processedImageStore: ProcessedImageStore,
  ) { }
}
