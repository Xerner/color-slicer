import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-centered-icon',
  standalone: true,
  templateUrl: './centered-icon.component.html',
  host: { class: 'flex flex-col gap-y-2 h-full justify-center items-center' },
  imports: [MatIconModule],
})
export class CenteredIconComponent {
  @Input({ required: true }) icon!: string;
}
