
import  React from "react"
import { Pagination as BootstrapPagination } from "react-bootstrap"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = startPage + maxPagesToShow - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  if (totalPages < 1) return null

  return (
    <BootstrapPagination className="justify-content-center mt-4">
      <BootstrapPagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
      <BootstrapPagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />

      {getPageNumbers().map((number) => (
        <BootstrapPagination.Item key={number} active={number === currentPage}  onClick={() => onPageChange(number)}>
          <c style={{color: number === currentPage ? 'white' : 'blue'}}>{number}</c>
        </BootstrapPagination.Item>
      ))}

      <BootstrapPagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
      <BootstrapPagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
    </BootstrapPagination>
  )
}

export default Pagination
