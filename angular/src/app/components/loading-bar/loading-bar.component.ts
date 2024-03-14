import { Component } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingStore } from "../../services/stores/loading.store.service";
import { map } from "rxjs";

@Component({
  selector: "app-loading-bar",
  templateUrl: "./loading-bar.component.html",
  standalone: true,
  imports: [
    MatProgressBarModule,
  ],
})
export class LoadingBarComponent {
  constructor(
    protected loadingStoreService: LoadingStore,
  ) { }
}