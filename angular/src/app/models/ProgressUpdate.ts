import { DateTime } from "luxon";

export type ProgressUpdateFunc = (update: ProgressUpdate) => void

export interface ProgressUpdate {
  header?: string;
  message?: string;
  progress?: number;
  eta?: DateTime;
}
