import { Component } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingStore } from "../../services/stores/loading.store.service";
import { DateTime } from "luxon";
import { TimePipe } from "../../pipes/time.pipe";

@Component({
  selector: "app-loading-bar",
  templateUrl: "./loading-bar.component.html",
  standalone: true,
  imports: [
    MatProgressBarModule,
    TimePipe,
  ],
})
export class LoadingBarComponent {
  DateTime = DateTime;
  constructor(
    protected loadingStore: LoadingStore,
  ) { }
}
