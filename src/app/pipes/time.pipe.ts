import { Pipe, PipeTransform } from "@angular/core";
import { DateTime } from "luxon";

@Pipe({
  standalone: true,
  name: 'time'
})
export class TimePipe implements PipeTransform {
  static readonly DEFAULT_FORMAT = DateTime.TIME_24_WITH_SECONDS;
  transform(datetime: DateTime): string {
    var timeStr = datetime.toLocaleString(TimePipe.DEFAULT_FORMAT);
    return timeStr;
  }
}
