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

  // cell render (istəyə görə)
  cell?: (row: T) => React.ReactNode;

  // ✅ sorting / filtering
  enableSorting?: boolean;
  enableColumnFilter?: boolean;

  // ✅ bu vacibdir: sort hansı dəyərə görə olsun?
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
};

function normalizeSortVal(v: unknown): string | number {
  if (v == null) return "";
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  // "3500" kimi string-lər gəlirsə:
  const n = Number(v);
  if (!Number.isNaN(n) && String(v).trim() !== "") return n;
  return String(v).toLowerCase();
}

function toTanstackColumns<T extends object>(
  cols: ColumnDef<T>[]
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

      // ✅ sorting fix: salary/base/date kimi şeyləri düzgün müqayisə et
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

function DefaultColumnFilter({ column }: { column: any }) {
  const meta = column.columnDef.meta as
    | { filterVariant?: "text" | "select"; filterOptions?: string[] }
    | undefined;

  const variant = meta?.filterVariant ?? "text";

  if (variant === "select") {
    const opts = meta?.filterOptions ?? [];
    return (
      <select
        className="h-9 rounded border px-3 text-sm"
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
      className="h-9 w-[200px] rounded border px-3 text-sm"
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
}: Props<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const tanColumns = React.useMemo(() => toTanstackColumns(columns), [columns]);

  const table = useReactTable({
    data: rows,
    columns: tanColumns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,

    getRowId: (row, idx) => {
      try {
        return getRowKey(row as T);
      } catch {
        return String(idx);
      }
    },

    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").trim().toLowerCase();
      if (!q) return true;

      const obj = row.original as any;

      if (globalSearchKeys?.length) {
        return globalSearchKeys.some((k) =>
          String(obj?.[k] ?? "").toLowerCase().includes(q)
        );
      }

      return Object.values(obj).some((v) =>
        typeof v === "string" ? v.toLowerCase().includes(q) : false
      );
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded border bg-white p-3">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={globalSearchPlaceholder}
          className="h-9 w-[260px] rounded border px-3 text-sm"
        />

        {table
          .getAllColumns()
          .filter((c) => c.getCanFilter())
          .map((col) => (
            <div key={col.id} className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{col.id}</span>
              <DefaultColumnFilter column={col} />
            </div>
          ))}

        <button
          className="h-9 rounded border px-3 text-sm hover:bg-gray-50"
          onClick={() => {
            setGlobalFilter("");
            setSorting([]);
            setColumnFilters([]);
          }}
        >
          Sıfırla
        </button>
      </div>

      <div className="overflow-hidden rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
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
                      className={`border-b px-3 py-2 text-left font-semibold ${
                        meta?.className ?? ""
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          canSort ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={
                          canSort ? h.column.getToggleSortingHandler() : undefined
                        }
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sortDir === "asc"
                          ? "▲"
                          : sortDir === "desc"
                          ? "▼"
                          : ""}
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
                <td className="px-3 py-6 text-center text-gray-500" colSpan={columns.length}>
                  Yüklənir…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((r) => (
                <tr key={r.id} className="border-t">
                  {r.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;

                    return (
                      <td key={cell.id} className={`px-3 py-2 ${meta?.className ?? ""}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length} nəticə
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
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
