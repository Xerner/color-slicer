import { Component } from "@angular/core";
import { MatListModule, MatSelectionList } from "@angular/material/list";
import { AppStoreService } from "../../services/app.store.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-image-selection",
  templateUrl: "./image-selection.component.html",
  standalone: true,
  imports: [
    MatSelectionList,
    MatListModule,
  ],
})
export class ImageSelectionComponent {
  images = toSignal(this.storeService.images);

  constructor(
    protected storeService: AppStoreService,
  ) {}
}
