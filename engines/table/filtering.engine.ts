export type DSTableFilterFunction<T> = (
    row: T,
    filters: Record<string, unknown>,
    search: string
  ) => boolean;
  
  export class FilteringEngine {
    static filter<T>(
      rows: T[],
      filters: Record<string, unknown>,
      search: string,
      predicate: DSTableFilterFunction<T>
    ): T[] {
      return rows.filter((row) => predicate(row, filters, search));
    }
  }