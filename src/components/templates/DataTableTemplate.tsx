'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, Download } from 'lucide-react';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface DataTableTemplateProps {
  columns: DataTableColumn[];
  data: Record<string, any>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  pageSize?: number;
  exportable?: boolean;
}

const DataTableTemplate: React.FC<DataTableTemplateProps> = ({
  columns: columnDefs,
  data,
  title,
  description,
  searchable = true,
  pageSize = 10,
  exportable = true,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Convert column definitions to TanStack Table format
  const columns = useMemo<ColumnDef<Record<string, any>>[]>(
    () =>
      columnDefs.map((col) => ({
        accessorKey: col.key,
        header: col.label,
        enableSorting: col.sortable !== false,
        size: col.width ? parseInt(col.width) : undefined,
      })),
    [columnDefs]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const exportToCSV = () => {
    const headers = columnDefs.map((col) => col.label).join(',');
    const rows = data
      .map((row) => columnDefs.map((col) => row[col.key]).join(','))
      .join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-xl font-semibold text-black dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-black/60 dark:text-white/60">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200 overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-light-200 dark:border-dark-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                size={18}
              />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded-lg text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {exportable && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-100 dark:bg-dark-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-black dark:text-white uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center gap-2 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400'
                              : 'flex items-center gap-2'
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="flex flex-col">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown size={14} />
                              ) : (
                                <div className="opacity-30">
                                  <ChevronUp size={14} />
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-light-200 dark:divide-dark-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-black/60 dark:text-white/60"
                  >
                    No results found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-light-100 dark:hover:bg-dark-100 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-black dark:text-white"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-light-200 dark:border-dark-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-black/60 dark:text-white/60">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              data.length
            )}{' '}
            of {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded text-sm text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-100 dark:hover:bg-dark-100 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-black dark:text-white">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-white dark:bg-dark-primary border border-light-200 dark:border-dark-200 rounded text-sm text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-100 dark:hover:bg-dark-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableTemplate;

