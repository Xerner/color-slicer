import { Injectable } from "@angular/core";
import { LoadingStore } from "./stores/loading.store.service";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  constructor(
    private loadingStore: LoadingStore,
  ) { }

  update(message: string, progress: number = 0, eta: Date | null = null) {
    this.loadingStore.message.set(message);
    this.loadingStore.progress.set(progress);
    // this.loadingStore.eta.set(eta);
  }

  updateMessage(message: string) {
    this.loadingStore.message.set(message);
  }

  updateProgress(progress: number) {
    this.loadingStore.progress.set(progress);
  }

  reset() {
    this.loadingStore.message.set("");
    this.loadingStore.progress.set(0);
  }
}
