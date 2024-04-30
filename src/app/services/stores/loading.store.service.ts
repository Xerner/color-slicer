import { Injectable, signal } from "@angular/core";
import { Timer } from "../../models/Timer.js";
import { DateTime } from "luxon";

@Injectable({
  providedIn: 'root'
})
export class LoadingStore {
  isLoading = signal(false);
  progress = signal(0);
  header = signal("");
  message = signal("");
  timer = new Timer();
  eta = signal<DateTime | null>(null);

  reset() {
    this.progress.set(0);
    this.header.set("");
    this.message.set("");
    this.timer.stop();
    this.eta.set(null);
    this.isLoading.set(false);
  }
}
