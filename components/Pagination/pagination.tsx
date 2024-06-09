import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CustomPagination = ({ totalPages, page, setPage }) => {
  const pageNumbers = [];
  //   const totalPages = Math.ceil(total / LIMIT);
  //   console.log(numberOfChapters);

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    console.log(page, totalPages);
    if (page > 3 && page < totalPages - 2) {
      pageNumbers.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    } else if (page > 3 && page === totalPages - 1) {
      pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else if (page > 3 && page === totalPages - 2) {
      pageNumbers.push(1, "...", page - 1, page, page + 1, page + 2);
    } else if (page > 3 && page === totalPages) {
      pageNumbers.push(1, "...", totalPages - 1, totalPages);
    } else if (page === 3) {
      pageNumbers.push(1, "...", 2, 3, 4, "...", totalPages);
    } else {
      pageNumbers.push(1, 2, 3, "...", totalPages);
    }
  }
  return (
    <div className="flex justify-center mt-8">
      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => {
                  if (page !== 1) setPage(page - 1);
                }}
              />
            </PaginationItem>
          )}
          {pageNumbers.map((number, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={number === page}
                onClick={() => typeof number === "number" && setPage(number)}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ))}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                aria-disabled={true}
                onClick={() => {
                  setPage(page + 1);
                }}
                href="#"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
