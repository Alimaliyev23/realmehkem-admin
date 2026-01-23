import * as React from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";

import type {
  ColumnDef as TanColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

export type ColumnDef<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  className?: string;

  cell?: (row: T) => React.ReactNode;

  enableSorting?: boolean;
  enableColumnFilter?: boolean;

  sortValue?: (row: T) => string | number | Date | null | undefined;

  filterVariant?: "text" | "select";
  filterOptions?: string[];
};

type Props<T> = {
  rows: T[];
  columns: ColumnDef<T>[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  emptyText?: string;

  globalSearchPlaceholder?: string;
  globalSearchKeys?: (keyof T)[];

  // ✅ NEW (Header-dən idarə etmək üçün)
  globalFilterValue?: string;
  onGlobalFilterValueChange?: (v: string) => void;
};

function normalizeSortVal(v: unknown): string | number {
  if (v == null) return "";
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;

  const n = Number(v);
  if (!Number.isNaN(n) && String(v).trim() !== "") return n;

  return String(v).toLowerCase();
}

function toTanstackColumns<T extends object>(
  cols: ColumnDef<T>[],
): TanColumnDef<T, any>[] {
  return cols.map((c) => {
    const accessorKey = String(c.key);

    return {
      accessorKey,
      header: () => c.header,

      cell: (ctx) => {
        const original = ctx.row.original as T;
        if (c.cell) return c.cell(original);

        const v = ctx.getValue();
        return v == null ? "—" : String(v);
      },

      enableSorting: c.enableSorting ?? false,
      enableColumnFilter: c.enableColumnFilter ?? false,

      sortingFn: (rowA, rowB, columnId) => {
        const aRaw = c.sortValue
          ? c.sortValue(rowA.original as T)
          : rowA.getValue(columnId);
        const bRaw = c.sortValue
          ? c.sortValue(rowB.original as T)
          : rowB.getValue(columnId);

        const a = normalizeSortVal(aRaw);
        const b = normalizeSortVal(bRaw);

        if (typeof a === "number" && typeof b === "number") return a - b;
        return String(a).localeCompare(String(b), "az");
      },

      meta: {
        className: c.className,
        filterVariant: c.filterVariant,
        filterOptions: c.filterOptions,
      },
    };
  });
}

const inputBase =
  "h-10 w-full rounded-lg border px-3 text-sm outline-none transition " +
  "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 " +
  "focus:ring-2 focus:ring-gray-200 " +
  "dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-400 " +
  "dark:focus:ring-white/10";

const selectBase =
  "h-10 w-full rounded-lg border px-3 text-sm outline-none transition " +
  "border-gray-200 bg-white text-gray-900 " +
  "focus:ring-2 focus:ring-gray-200 " +
  "dark:border-white/10 dark:bg-white/5 dark:text-gray-100 " +
  "dark:focus:ring-white/10";

function DefaultColumnFilter({ column }: { column: any }) {
  const meta = column.columnDef.meta as
    | { filterVariant?: "text" | "select"; filterOptions?: string[] }
    | undefined;

  const variant = meta?.filterVariant ?? "text";

  if (variant === "select") {
    const opts = meta?.filterOptions ?? [];
    return (
      <select
        className={selectBase}
        value={(column.getFilterValue() as string) ?? "all"}
        onChange={(e) => {
          const v = e.target.value;
          column.setFilterValue(v === "all" ? undefined : v);
        }}
      >
        <option value="all">Hamısı</option>
        {opts.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={inputBase}
      placeholder="Filter…"
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
    />
  );
}

export function DataTable<T extends object>({
  rows,
  columns,
  getRowKey,
  isLoading,
  emptyText = "Məlumat yoxdur",
  globalSearchPlaceholder = "Axtar…",
  globalSearchKeys,

  globalFilterValue,
  onGlobalFilterValueChange,
}: Props<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // ✅ uncontrolled default
  const [globalFilterInternal, setGlobalFilterInternal] = React.useState("");

  // ✅ controlled varsa onu istifadə edirik
  const globalFilter = globalFilterValue ?? globalFilterInternal;
  const setGlobalFilter = (v: string) => {
    onGlobalFilterValueChange?.(v);
    if (!onGlobalFilterValueChange) setGlobalFilterInternal(v);
  };

  const tanColumns = React.useMemo(() => toTanstackColumns(columns), [columns]);

  const table = useReactTable({
    data: rows,
    columns: tanColumns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (v) => setGlobalFilter(String(v ?? "")),

    getRowId: (row, idx) => {
      try {
        return getRowKey(row as T);
      } catch {
        return String(idx);
      }
    },

    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!q) return true;

      const obj = row.original as any;

      if (globalSearchKeys?.length) {
        return globalSearchKeys.some((k) =>
          String(obj?.[k] ?? "")
            .toLowerCase()
            .includes(q),
        );
      }

      return Object.values(obj).some((v) =>
        typeof v === "string" ? v.toLowerCase().includes(q) : false,
      );
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-3">
      {/* ✅ toolbar: responsive + premium + dark */}
      <div
        className="rounded-xl border p-3 shadow-sm
        border-gray-200 bg-white
        dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={globalSearchPlaceholder}
              className={`${inputBase} sm:w-[280px]`}
            />

            <div className="flex flex-wrap gap-3">
              {table
                .getAllColumns()
                .filter((c) => c.getCanFilter())
                .map((col) => (
                  <div key={col.id} className="w-full sm:w-[220px]">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      {col.id}
                    </div>
                    <DefaultColumnFilter column={col} />
                  </div>
                ))}
            </div>
          </div>

          <button
            className="h-10 w-full lg:w-auto rounded-lg border px-4 text-sm transition
              border-gray-200 bg-white hover:bg-gray-50
              dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            onClick={() => {
              setGlobalFilter("");
              setSorting([]);
              setColumnFilters([]);
            }}
          >
            Sıfırla
          </button>
        </div>
      </div>

      {/* ✅ table wrapper: horizontal scroll + premium + dark */}
      <div
        className="overflow-x-auto rounded-xl border shadow-sm
        border-gray-200 bg-white
        dark:border-white/10 dark:bg-white/5"
      >
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort();
                  const sortDir = h.column.getIsSorted();
                  const meta = h.column.columnDef.meta as
                    | { className?: string }
                    | undefined;

                  return (
                    <th
                      key={h.id}
                      className={`border-b px-3 py-3 text-left font-semibold
                        border-gray-200 text-gray-900
                        dark:border-white/10 dark:text-gray-100
                        ${meta?.className ?? ""}`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          canSort ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={
                          canSort
                            ? h.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {sortDir === "asc"
                            ? "▲"
                            : sortDir === "desc"
                              ? "▼"
                              : ""}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                  colSpan={columns.length}
                >
                  Yüklənir…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                  colSpan={columns.length}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t transition
                    border-gray-100 hover:bg-gray-50/70
                    dark:border-white/10 dark:hover:bg-white/5"
                >
                  {r.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;

                    return (
                      <td
                        key={cell.id}
                        className={`px-3 py-3 text-gray-900 dark:text-gray-100 ${meta?.className ?? ""}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ pagination: premium + dark */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {table.getFilteredRowModel().rows.length} nəticə
        </div>

        <div className="flex items-center gap-2">
          <button
            className="h-10 w-10 rounded-lg border text-sm transition disabled:opacity-50
              border-gray-200 bg-white hover:bg-gray-50
              dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ←
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            className="h-10 w-10 rounded-lg border text-sm transition disabled:opacity-50
              border-gray-200 bg-white hover:bg-gray-50
              dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
