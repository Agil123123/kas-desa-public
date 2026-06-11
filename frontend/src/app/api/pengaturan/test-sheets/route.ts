import { NextResponse } from 'next/server';
import { db, pengaturan } from '@kas/backend';
import { requireAuth } from '@/lib/auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth('Super Admin');
    if (!auth.success) return auth.response;

    const config = await db.select().from(pengaturan).limit(1);
    if (!config.length || !config[0].googleSheetId) {
      return NextResponse.json({ error: 'Spreadsheet ID belum disimpan.' }, { status: 400 });
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Environment variables GOOGLE_CLIENT_EMAIL atau GOOGLE_PRIVATE_KEY belum diset di Vercel.' }, { status: 400 });
    }

    // Fix escaping if needed
    privateKey = privateKey.replace(/\\n/g, '\n');

    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    // Test writing a single cell
    await sheets.spreadsheets.values.append({
      spreadsheetId: config[0].googleSheetId,
      range: 'Kas Jimpitan!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['TEST-DELETE-ME', new Date().toISOString()]],
      },
    });

    // Test Reading
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: config[0].googleSheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Kas Jimpitan');
    const sheetId = sheet?.properties?.sheetId;

    const responseGet = await sheets.spreadsheets.values.get({
      spreadsheetId: config[0].googleSheetId,
      range: 'Kas Jimpitan!A:A',
    });
    const rows = responseGet.data.values || [];
    let rowIndex = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][0] === 'TEST-DELETE-ME') {
        rowIndex = i;
        break;
      }
    }

    // Test Deleting
    if (rowIndex !== -1 && sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: config[0].googleSheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });
    }

    return NextResponse.json({ message: 'Koneksi berhasil! Akses Tulis, Baca, dan Hapus (Delete) berfungsi dengan baik.' });
  } catch (error: any) {
    console.error('Test Sheets Error:', error);
    // Return the actual Google API error message
    return NextResponse.json({ 
      error: `Gagal: ${error.message || 'Kesalahan tidak diketahui'}` 
    }, { status: 500 });
  }
}
