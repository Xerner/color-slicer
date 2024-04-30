import { inject } from "@angular/core";
import { LoadingService } from "../services/loading.service";

export class CustomError extends Error {
  loadingService = inject(LoadingService);

  constructor(
    message: string
  ) {
    super(message);
    this.loadingService.updateMessage(message);
  }
}
