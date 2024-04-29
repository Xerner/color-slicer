import { Injectable } from "@angular/core";
import { LoadingStore } from "./stores/loading.store.service";
import { DateTime } from "luxon";
import { ProgressUpdate } from "../models/ProgressUpdate";

@Injectable({
  providedIn: "root"
})
export class LoadingService {
  constructor(
    private loadingStore: LoadingStore,
  ) {}

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
    if (Math.log10(progress) < 1) {
      progress = progress * 100
    }
    // var currentTime = this.loadingStore.time();
    // if (currentTime == null) {

    // }
    // this.loadingStore.timePassed = Math.abs(currentTime.diffNow("milliseconds").milliseconds);
    // this.resetTime();
    this.loadingStore.progress.set(progress);
  }

  updateTime(time: DateTime | undefined) {
    if (time === undefined) {
      return;
    }
    this.loadingStore.time.set(time);
  }

  reset() {
    this.loadingStore.reset();
  }
}
