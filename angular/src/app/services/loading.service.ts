import { Injectable } from "@angular/core";
import { LoadingStore } from "./stores/loading.store.service";
import { DateTime } from "luxon";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  constructor(
    private loadingStore: LoadingStore,
  ) { }

  updateHeader(header: string) {
    this.loadingStore.header.set(header);
  }

  resetTime() {
    this.loadingStore.time = DateTime.now();
  }

  update(message: string, progress: number = 0, eta: Date | null = null) {
    this.updateMessage(message);
    this.updateProgress(progress);
    // this.loadingStore.eta.set(eta);
    console.log(`${this.loadingStore.message()}, \t${this.loadingStore.progress()}% \t${this.loadingStore.timePassed} ms \tETA: ${eta}`);
  }

  updateMessage(message: string) {
    this.loadingStore.message.set(message);
  }

  updateProgress(progress: number) {
    if (Math.log10(progress) < 1) {
      progress = progress * 100
    }
    this.loadingStore.timePassed = Math.abs(this.loadingStore.time.diffNow("milliseconds").milliseconds);
    this.resetTime();
    this.loadingStore.progress.set(progress);
  }

  reset() {
    this.loadingStore.message.set("");
    this.loadingStore.progress.set(0);
  }
}
