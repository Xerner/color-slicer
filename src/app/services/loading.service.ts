import { Injectable } from "@angular/core";
import { LoadingStore } from "./stores/loading.store.service";
import { DateTime } from "luxon";
import { ProgressUpdate } from "../models/ProgressUpdate";
import { clamp } from "../library/math";
import { TimePipe } from "../pipes/time.pipe";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  constructor(
    private loadingStore: LoadingStore,
  ) {}

  start() {
    this.loadingStore.header.set("");
    this.loadingStore.message.set("");
    this.loadingStore.isLoading.set(true);
    this.loadingStore.timer.start();
  }

  finish() {
    var finishedTimeStr = this.loadingStore.timer.time()?.toLocaleString(TimePipe.DEFAULT_FORMAT);
    this.loadingStore.header.set(`Finished in ${finishedTimeStr}`);
    this.loadingStore.message.set("");
    this.loadingStore.isLoading.set(false);
    this.loadingStore.eta.set(null);
    this.loadingStore.timer.stop();
  }

  update(update: ProgressUpdate) {
    this.updateHeader(update.header);
    this.updateMessage(update.message);
    this.updateProgress(update.progress);
    this.updateTime(update.eta);
    console.log("Progress update", update);
  }

  updateHeader(header: string | undefined) {
    if (header === undefined) {
      return;
    }
    this.loadingStore.header.set(header);
  }

  updateMessage(message: string | undefined) {
    if (message === undefined) {
      return;
    }
    this.loadingStore.message.set(message);
  }

  updateProgress(progress: number | undefined) {
    if (progress === undefined) {
      return;
    }
    progress = clamp(progress * 100, 0, 100)
    this.loadingStore.progress.set(progress);
  }

  updateTime(time: string | undefined) {
    if (time === undefined) {
      return;
    }
    this.loadingStore.eta.set(DateTime.fromISO(time));
  }

  reset() {
    this.loadingStore.reset();
  }
}
