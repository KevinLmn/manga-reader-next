'use client';

import { useEffect, useState } from 'react';

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const CustomPagination: React.FC<PaginationProps> = ({ page, setPage, totalPages }) => {
  const [pageNumbers, setPageNumbers] = useState<(number | string)[]>([]);

  useEffect(() => {
    const calculatePageNumbers = () => {
      const numbers: (number | string)[] = [];

      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          numbers.push(i);
        }
      } else {
        if (page > 3 && page < totalPages - 2) {
          numbers.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        } else if (page > 3 && page === totalPages - 1) {
          numbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else if (page > 3 && page === totalPages - 2) {
          numbers.push(1, '...', page - 1, page, page + 1, page + 2);
        } else if (page > 3 && page === totalPages) {
          numbers.push(1, '...', totalPages - 1, totalPages);
        } else if (page === 3) {
          numbers.push(1, 2, 3, 4, '...', totalPages);
        } else {
          numbers.push(1, 2, 3, '...', totalPages);
        }
      }

      setPageNumbers(numbers);
    };

    calculatePageNumbers();
  }, [page, totalPages]);

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-1">
        {page > 1 && (
          <button
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700"
            aria-label="Previous page"
          >
            &lt;
          </button>
        )}

        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === 'number' && setPage(number)}
            className={`px-3 py-1 rounded ${
              number === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-700'
            } ${typeof number !== 'number' ? 'cursor-default' : 'cursor-pointer'}`}
            disabled={typeof number !== 'number'}
          >
            {number}
          </button>
        ))}

        {page < totalPages && (
          <button
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700"
            aria-label="Next page"
          >
            &gt;
          </button>
        )}
      </nav>
    </div>
  );
};

export default CustomPagination;
