import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source, timestamp, userAgent, referrer } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const SHEET_ID = '11sIMKES9Vdpx_SvueK5hMalp82yNqBBhFHEUTxUiTcU'; // <-- Replace with your Google Sheet ID
  const RANGE = 'Sheet1!A:E';

  // Load credentials from environment variables
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!client_email || !private_key) {
    return res.status(500).json({ error: 'Google service account credentials not set' });
  }

  try {
    const auth = new google.auth.JWT(
      client_email,
      null,
      private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });

    const row = [timestamp || new Date().toISOString(), email, source, userAgent, referrer];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    res.status(200).json({ success: true, message: 'Email logged to Google Sheets' });
  } catch (error) {
    console.error('Google Sheets error:', error);
    res.status(500).json({ error: error.message });
  }
}
