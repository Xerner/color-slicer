// from https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript
type GrowToSize<T, N extends number, A extends T[]> = 
  A['length'] extends N ? A : GrowToSize<T, N, [...A, T]>;

export type FixedArray<T, N extends number> = GrowToSize<T, N, []>;
