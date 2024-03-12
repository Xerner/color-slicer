import { signal } from "@angular/core";
import { DateTime } from "luxon";
import { interval, takeWhile } from "rxjs";

export class Timer {
  format = "HH:mm:ss";
  timer: DateTime = DateTime.now();
  time = signal("");
  paused = false;

  start() {
    this.timer = DateTime.now();
    this.resume();
  }

  resume() {
    this.paused = false;
    interval(1000)
      .pipe(takeWhile(() => !this.paused))
      .subscribe((value) => {
      this.time.set(this.timer.plus({ seconds: value }).toFormat(this.format));
    });
  }

  pause() {
    this.paused = true;
  }
  
  stop() {
    this.paused = false;
    this.time.set("")
  }
}
