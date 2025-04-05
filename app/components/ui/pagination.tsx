import { cn } from '@/lib/utils';
import * as React from 'react';
import { Button } from './button';

interface PaginationProps {
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
}

const CustomPagination = ({ totalPages, page, setPage }: PaginationProps) => {
  const pageNumbers: (number | string)[] = [];
  //   const totalPages = Math.ceil(total / LIMIT);
  //   console.log(numberOfChapters);

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (page > 3 && page < totalPages - 2) {
      pageNumbers.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    } else if (page > 3 && page === totalPages - 1) {
      pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else if (page > 3 && page === totalPages - 2) {
      pageNumbers.push(1, '...', page - 1, page, page + 1, page + 2);
    } else if (page > 3 && page === totalPages) {
      pageNumbers.push(1, '...', totalPages - 1, totalPages);
    } else if (page === 3) {
      pageNumbers.push(1, '...', 2, 3, 4, '...', totalPages);
    } else {
      pageNumbers.push(1, 2, 3, '...', totalPages);
    }
  }

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {page > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            className={cn('h-8 w-8 p-0')}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        )}
        {pageNumbers.map((number, index) => (
          <Button
            key={index}
            variant={number === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => typeof number === 'number' && setPage(number)}
            disabled={typeof number !== 'number'}
            className={cn('h-8 w-8 p-0', typeof number !== 'number' && 'cursor-default')}
          >
            {number}
          </Button>
        ))}
        {page < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            className={cn('h-8 w-8 p-0')}
          >
            <span className="sr-only">Next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        )}
      </nav>
    </div>
  );
};

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default CustomPagination;
