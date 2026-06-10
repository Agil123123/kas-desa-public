import * as XLSX from 'xlsx';

/**
 * Utility to export an array of JSON objects to an Excel file.
 * @param data Array of objects to export
 * @param filename Desired filename without extension (e.g., 'Laporan_Kas')
 * @param sheetName Name of the sheet (e.g., 'Data')
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
