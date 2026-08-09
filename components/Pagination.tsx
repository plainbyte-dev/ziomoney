"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalResults);

  return (
    <div className="flex flex-col gap-3 pt-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {start}-{end} of {totalResults} results
      </span>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-heading text-panel"
                : "text-heading/70 hover:bg-surface"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-heading/70 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
