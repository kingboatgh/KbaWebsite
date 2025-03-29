import React from "react";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(
      Math.min(
        currentPage - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages + 1
      ),
      1
    );
    visiblePages = pages.slice(start - 1, start + maxVisiblePages - 1);
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <PaginationContent>
      <PaginationItem>
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          aria-disabled={currentPage === 1}
        />
      </PaginationItem>

      {visiblePages[0] > 1 && (
        <>
          <PaginationItem>
            <PaginationLink
              onClick={() => handlePageChange(1)}
              isActive={currentPage === 1}
              aria-current={currentPage === 1 ? "page" : undefined}
            >
              1
            </PaginationLink>
          </PaginationItem>
          {visiblePages[0] > 2 && (
            <PaginationItem>
              <PaginationEllipsis aria-hidden="true" />
            </PaginationItem>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            onClick={() => handlePageChange(page)}
            isActive={currentPage === page}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <PaginationItem>
              <PaginationEllipsis aria-hidden="true" />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              aria-current={currentPage === totalPages ? "page" : undefined}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        </>
      )}

      <PaginationItem>
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          aria-disabled={currentPage === totalPages}
        />
      </PaginationItem>
    </PaginationContent>
  );
} 