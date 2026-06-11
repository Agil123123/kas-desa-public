import { google } from 'googleapis';

export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string, // e.g. "Jimpitan" or "Kas Karangtaruna"
  data: any[]
) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey || !spreadsheetId) {
      console.log('Google Sheets credentials or Spreadsheet ID not configured.');
      return;
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`, // It will automatically append to the next empty row
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    console.log('Successfully appended row to Google Sheet:', sheetName);
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
  }
}
