export type ProgressUpdateFunc = (update: ProgressUpdate) => void

export interface ProgressUpdate {
  header?: string;
  message?: string;
  progress?: number;
  /** ISO formatted datetime string */
  eta?: string;
}
