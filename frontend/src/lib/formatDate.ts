export function formatDateDDMMYYYY(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  // Try to parse the date. If it's stored as "YYYY-MM-DD HH:mm", we split it.
  const parts = dateString.split(/[- T]/);
  
  // If it matches standard YYYY-MM-DD format (at least 3 parts)
  if (parts.length >= 3 && parts[0].length === 4) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    return `${day}-${month}-${year}`;
  }

  // Fallback if format is not as expected, but strip time if exists
  if (dateString.includes(' ') || dateString.includes('T')) {
      return dateString.split(/[ T]/)[0];
  }
  return dateString;
}
