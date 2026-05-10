import { useState } from 'react'

export const Table = ({ columns, data, onRowClick, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`
                  hover:bg-gray-50/50 transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []
  const maxVisible = 5
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            px-3 py-1 rounded-lg transition-colors
            ${page === currentPage
              ? 'bg-primary-500 text-white'
              : 'hover:bg-gray-100'
            }
          `}
        >
          {page}
        </button>
      ))}
      
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default Table