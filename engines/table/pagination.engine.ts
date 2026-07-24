export type PaginationResult<T> = {
    rows: T[];
    page: number;
    pageSize: number;
    totalRows: number;
    totalPages: number;
  };
  
  export class PaginationEngine {
    static paginate<T>(
      rows: T[],
      page: number,
      pageSize: number
    ): PaginationResult<T> {
      const totalRows = rows.length;
  
      const totalPages = Math.max(
        1,
        Math.ceil(totalRows / pageSize)
      );
  
      const currentPage = Math.min(
        Math.max(page, 1),
        totalPages
      );
  
      const start = (currentPage - 1) * pageSize;
  
      const end = start + pageSize;
  
      return {
        rows: rows.slice(start, end),
        page: currentPage,
        pageSize,
        totalRows,
        totalPages,
      };
    }
  }