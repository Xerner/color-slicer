import { signal } from "@angular/core";
import { DateTime } from "luxon";
import { Subscription, interval, takeWhile } from "rxjs";

export class Timer {
  time = signal<DateTime | null>(null);
  paused = false;
  private timeout: NodeJS.Timeout | null = null;
  private timerCallback = this.countTimer.bind(this);
  private boundTimerFn = this.countTimer.bind(this);

  start() {
    this.time.set(DateTime.now().set({ hour: 0, minute: 0, second: 0 }));
    this.timeout = setInterval(this.boundTimerFn, 1000)
  }

  private countTimer() {
    this.time.set(this.time()!.plus({ seconds: 1 }));
  }

  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
  }
  
  stop() {
    this.paused = false;
    this.time.set(null)
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }
}
