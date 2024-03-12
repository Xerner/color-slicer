import { Injectable, signal } from "@angular/core";
import { Timer } from "../../models/Timer.js";
import { DateTime } from "luxon";

@Injectable({
  providedIn: 'root'
})
export class LoadingStore {
  progress = signal(0);
  header = signal("");
  message = signal("");
  timer = new Timer();
  time = DateTime.now();
  timePassed = 0;
  // eta = DateTime.now();

  reset() {
    this.progress.set(0);
    this.header.set("");
    this.message.set("");
    this.timer.stop();
    this.time = DateTime.now();
  }
}
