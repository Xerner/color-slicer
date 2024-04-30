import { Injectable } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Injectable({ 
  providedIn: 'root',
  deps: [
    ReactiveFormsModule
  ],
})
export class KMeansFormService {
  form = new FormGroup({
    clusters: new FormControl<number>(4, Validators.required),
    iterations: new FormControl<number>(10, Validators.required),
  });
}