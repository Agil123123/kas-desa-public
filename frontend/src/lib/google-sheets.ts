import { google } from 'googleapis';

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function appendToSheet(
  spreadsheetId: string,
  sheetName: string,
  data: any[]
) {
  try {
    const auth = getAuth();
    if (!auth || !spreadsheetId) return;

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    const rangeStr = response.data.updates?.updatedRange;
    if (rangeStr) {
      const rowMatch = rangeStr.match(/\d+$/);
      if (rowMatch) {
        const rowIndex = parseInt(rowMatch[0], 10) - 1;
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
        if (sheet && sheet.properties?.sheetId !== undefined) {
          const sheetId = sheet.properties.sheetId;
          const jenis = data[3];
          const isMasuk = jenis === 'Masuk';
          
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: rowIndex,
                      endRowIndex: rowIndex + 1,
                      startColumnIndex: 4, // Column E
                      endColumnIndex: 5
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: isMasuk 
                          ? { red: 0.85, green: 0.95, blue: 0.85 } // Light Green
                          : { red: 0.98, green: 0.85, blue: 0.85 } // Light Red
                      }
                    },
                    fields: "userEnteredFormat.backgroundColor"
                  }
                }
              ]
            }
          });
        }
      }
    }
    console.log('Successfully appended row to Google Sheet:', sheetName);
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
  }
}

export async function deleteFromSheet(
  spreadsheetId: string,
  sheetName: string,
  noTransaksi: string
) {
  try {
    const auth = getAuth();
    if (!auth || !spreadsheetId) return;

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    if (!sheet || sheet.properties?.sheetId === undefined) return;
    const sheetId = sheet.properties.sheetId;

    // 2. Find row index by No Transaksi
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return;

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === noTransaksi) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return;

    // 3. Delete row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
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
    console.log(`Successfully deleted row from Google Sheet:`, sheetName);
  } catch (error) {
    console.error('Failed to delete from Google Sheet:', error);
  }
}

export async function updateInSheet(
  spreadsheetId: string,
  sheetName: string,
  noTransaksi: string,
  data: any[]
) {
  try {
    const auth = getAuth();
    if (!auth || !spreadsheetId) return;

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Find row index by No Transaksi
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return;

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === noTransaksi) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return;

    // 2. Update row
    const endCol = String.fromCharCode(64 + data.length); // 7 items -> G, 8 items -> H
    const range = `${sheetName}!A${rowIndex + 1}:${endCol}${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    if (sheet && sheet.properties?.sheetId !== undefined) {
      const sheetId = sheet.properties.sheetId;
      const jenis = data[3];
      const isMasuk = jenis === 'Masuk';
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: rowIndex,
                  endRowIndex: rowIndex + 1,
                  startColumnIndex: 4, // Column E
                  endColumnIndex: 5
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: isMasuk 
                      ? { red: 0.85, green: 0.95, blue: 0.85 } // Light Green
                      : { red: 0.98, green: 0.85, blue: 0.85 } // Light Red
                  }
                },
                fields: "userEnteredFormat.backgroundColor"
              }
            }
          ]
        }
      });
    }
    console.log(`Successfully updated row in Google Sheet:`, sheetName);
  } catch (error) {
    console.error('Failed to update in Google Sheet:', error);
  }
}
