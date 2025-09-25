import React from 'react'

const Pagination = ({
    currentPage,
    totalPages,
    totalResults,
    onPageChange,
    onPrevPage,
    onNextPage,
    paginationInfo
}) => {
    if (totalPages <= 1) return null;

    return (
        <>
            {totalResults > 0 && (
                <div className="pagination-info">
                    <p className="text-gray-100 text-sm mb-4">
                        Showing {paginationInfo.startResult} - {paginationInfo.endResult} of {totalResults} movies
                    </p>
                </div>
            )}
            
            <div className="pagination">
                <button 
                    onClick={onPrevPage}
                    disabled={!paginationInfo.hasPrevPage}
                    className="pagination-btn"
                >
                    Previous
                </button>
                
                <div className="pagination-numbers">
                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        let page;
                        if (totalPages <= 5) {
                            page = index + 1;
                        } else if (currentPage <= 3) {
                            page = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + index;
                        } else {
                            page = currentPage - 2 + index;
                        }
                        
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>
                
                <button 
                    onClick={onNextPage}
                    disabled={!paginationInfo.hasNextPage}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </>
    )
}

export default Pagination