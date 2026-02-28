"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowUpDown,
  MoreHorizontal,
} from "@/app/components/icons";
import CustomSelect from "../../../components/CustomSelect";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const generatePagination = (currentPage, totalPages, siblings = 1) => {
  const totalNumbers = siblings * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSiblingIndex = Math.max(currentPage - siblings, 0);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages - 1);

  const shouldShowLeftDots = leftSiblingIndex > 1;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 0;
  const lastPageIndex = totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = siblings * 2 + 2; // Current + siblings + first page
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
    return [...leftRange, "...", lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = siblings * 2 + 2; // Current + siblings + last page
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => lastPageIndex - rightItemCount + 1 + i
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  // Fallback (should not happen with logic above, but good practice)
  return Array.from({ length: totalPages }, (_, i) => i);
};

// Component for the main data table and pagination
const StudentTable = ({
  data, // The data to display (already filtered in the parent)
  columns, // Column definitions passed from parent
  columnVisibility, // State for column visibility
  globalFilter, // Global search term
  pagination, // Pagination state managed by Tanstack Table
  setPagination, // Setter for pagination state
  sorting, // Sorting state
  setSorting, // Setter for sorting state
  rowSelection,
  setRowSelection,
  onDeleteSelected, // Function(ids: string[]) for bulk delete
  isLoading,
  user, // <-- add user prop
  isAdmin, // <-- add isAdmin prop
  isTableLoading = false,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRowsToDelete, setSelectedRowsToDelete] = useState([]);
  const [canBulkDelete, setCanBulkDelete] = useState(true);
  const [bulkDeletePermissionMessage, setBulkDeletePermissionMessage] =
    useState("");
  // TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      globalFilter,
      pagination,
      sorting,
      rowSelection,
    },
    // Pass setters to Tanstack Table
    onColumnVisibilityChange: () => {},
    onGlobalFilterChange: () => {},
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Features
    enableRowSelection: true,
    manualPagination: true,
    pageCount: pagination.totalPages,
    // debugTable: true, // Uncomment for debugging
  });

  // Calculate visible columns count for colspan
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <section
      className="border border-gray-200 rounded-xl overflow-hidden"
      aria-labelledby="student-table-heading"
    >
      <h2 id="student-table-heading" className="sr-only">
        Student Data Table
      </h2>
      {/* Delete confirmation banner - shown only when 2 or more rows are selected */}
      {Object.keys(rowSelection).length >= 2 && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-3 flex flex-col md:flex-row items-center justify-between">
          <p className="text-yellow-800 text-sm font-medium mb-2 md:mb-0">
            {Object.keys(rowSelection).length} students selected
          </p>
          <button
            onClick={() => {
              // Map rowSelection keys (row indices) to actual _id values
              const selectedIds = Object.keys(rowSelection)
                .map((rowId) => data[rowId]?._id)
                .filter(Boolean);
              // Permission logic: only admin or user with modify_access
              let canDelete = isAdmin || user?.modify_access === true;
              let permissionMessage = "";
              if (!canDelete) {
                permissionMessage =
                  "Only admins or users with modify access can delete records.";
              }
              setSelectedRowsToDelete(selectedIds);
              setCanBulkDelete(canDelete);
              setBulkDeletePermissionMessage(permissionMessage);
              setIsDeleteModalOpen(true);
            }}
            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label="Delete selected students"
          >
            Delete Selected
          </button>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (onDeleteSelected && canBulkDelete) {
            onDeleteSelected(selectedRowsToDelete);
          }
          setRowSelection({});
          setIsDeleteModalOpen(false);
          setSelectedRowsToDelete([]);
        }}
        title="Delete Students"
        message={`Are you sure you want to delete ${selectedRowsToDelete.length} students? This action cannot be undone.`}
        canDelete={canBulkDelete}
        permissionMessage={bulkDeletePermissionMessage}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Head */}
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // Visibility is handled by Tanstack state
                  if (!header.column.getIsVisible()) return null;

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      scope="col"
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:bg-gray-100"
                          : ""
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                      title={
                        header.column.getCanSort()
                          ? `Sort by ${flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}`
                          : undefined
                      }
                      aria-sort={
                        header.column.getCanSort()
                          ? header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {/* Use Lucide icon for sorting indicator */}
                        {header.column.getCanSort() && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 transition-opacity ${
                              header.column.getIsSorted()
                                ? "opacity-100"
                                : "opacity-30 hover:opacity-70"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {isTableLoading ? (
              // Skeleton rows when table data is loading
              Array.from({ length: 10 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: visibleColumnCount }).map(
                    (_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnCount}
                  className="px-6 py-16 text-center text-sm text-gray-500"
                >
                  No student records match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-sm align-top ${
                        cell.column.id === "name"
                          ? "font-medium text-gray-900"
                          : "text-gray-500"
                      } ${
                        cell.column.id === "actions"
                          ? "whitespace-nowrap text-center"
                          : "whitespace-nowrap"
                      }`}
                      style={{
                        width:
                          cell.column.getSize() !== 150
                            ? cell.column.getSize()
                            : undefined,
                      }}
                    >
                      {/* Special rendering for status badge */}
                      {cell.column.id === "status" ? (
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            cell.getValue().toLowerCase() === "passed"
                              ? "bg-green-100 text-green-800"
                              : cell.getValue().toLowerCase() === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </span>
                      ) : (
                        // Default cell rendering
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- New Pagination Controls --- */}
      {pagination.totalPages > 0 && (
        <nav
          className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200"
          aria-label="Table navigation"
        >
          {/* Left side: Entries info */}
          <div className="flex items-center flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-700 mb-2 md:mb-0">
            {/* Entries Info */}
            <div>
              Showing{" "}
              <span className="font-medium">
                {pagination.total === 0 ? 0 : pagination.pageIndex * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {pagination.total === 0
                  ? 0
                  : Math.min(
                      pagination.pageIndex * 10 + data.length,
                      pagination.total
                    )}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> entries
            </div>
          </div>

          {/* Right side: Pagination buttons */}
          <div className="flex items-center justify-center md:justify-end">
            {/* First Page Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={pagination.pageIndex === 0}
              className="h-8 w-8 flex items-center justify-center rounded-l-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-100 enabled:focus:ring-1 enabled:focus:ring-red-500 enabled:focus:outline-none focus:z-10"
              aria-label="Go to first page"
              title="First page"
            >
              <ChevronsLeft size={18} />
            </button>
            {/* Previous Page Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.max(0, pagination.pageIndex - 1),
                }))
              }
              disabled={pagination.pageIndex === 0}
              className="h-8 w-8 flex items-center justify-center border-y border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-100 enabled:focus:ring-1 enabled:focus:ring-red-500 enabled:focus:outline-none focus:z-10"
              aria-label="Go to previous page"
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Number Buttons and Ellipses */}
            {generatePagination(
              pagination.pageIndex,
              pagination.totalPages
            ).map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="h-8 w-8 flex items-center justify-center text-gray-500 border-y border-gray-300 bg-white"
                  >
                    <MoreHorizontal size={16} />
                  </span>
                );
              }
              const pageIndex = page;
              const isActive = pagination.pageIndex === pageIndex;
              return (
                <button
                  key={pageIndex}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex }))
                  }
                  disabled={isActive}
                  className={`h-8 w-8 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:z-10 border-y border-gray-300 ${
                    isActive
                      ? "bg-red-800 text-white cursor-default border-red-800 z-10"
                      : "bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                  aria-label={`Go to page ${pageIndex + 1}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageIndex + 1}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: Math.min(
                    pagination.totalPages - 1,
                    pagination.pageIndex + 1
                  ),
                }))
              }
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              className="h-8 w-8 flex items-center justify-center border-y border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-100 enabled:focus:ring-1 enabled:focus:ring-red-500 enabled:focus:outline-none focus:z-10"
              aria-label="Go to next page"
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
            {/* Last Page Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: pagination.totalPages - 1,
                }))
              }
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              className="h-8 w-8 flex items-center justify-center rounded-r-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-gray-100 enabled:focus:ring-1 enabled:focus:ring-red-500 enabled:focus:outline-none focus:z-10"
              aria-label="Go to last page"
              title="Last page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </nav>
      )}
      {/* --- End New Pagination Controls --- */}
    </section>
  );
};

export default StudentTable;
