import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LoadingStore {
  progress = signal(0);
  message = signal("");
  // eta = DateTime.now();

  reset() {
    this.progress.set(0);
    this.message.set("");
  }
}
