import * as XLSX from "xlsx";

export type ExcelColumn<T> = {
  header: string;
  value: (row: T) => any;
  width?: number;
};

export function exportToExcel<T>(
  rows: T[],
  filename: string,
  sheetName: string,
  columns: ExcelColumn<T>[],
) {
  if (!rows || rows.length === 0) return;

  const data = [
    columns.map((c) => c.header),
    ...rows.map((r) => columns.map((c) => c.value(r))),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const widths = columns.map((c) => ({
    wch: c.width ?? Math.max(10, c.header.length + 2),
  }));
  (ws as any)["!cols"] = widths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const file = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, file);
}
