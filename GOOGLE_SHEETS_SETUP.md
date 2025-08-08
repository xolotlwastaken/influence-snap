# Google Sheets Email Logging Setup

This guide will help you set up automatic email logging to Google Sheets for your InfluenceSnap landing page.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it "InfluenceSnap Email Leads" (or any name you prefer)
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123...XYZ/edit` 
   - The ID would be: `1ABC123...XYZ`

## Step 2: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Delete the default code and paste the following:

```javascript
function doPost(e) {
  try {
    // Replace with your actual spreadsheet ID from Step 1
    const spreadsheetId = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();

    // Parse FormData parameters
    const email = e.parameter.email || '';
    const source = e.parameter.source || '';
    const timestamp = e.parameter.timestamp || new Date().toISOString();
    const userAgent = e.parameter.userAgent || '';
    const referrer = e.parameter.referrer || '';

    // Add headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Email', 'Source', 'User Agent', 'Referrer']
      ]);
      // Style the headers
      const headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setBackground('#4285F4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    // Add the new email entry
    sheet.appendRow([
      new Date(timestamp),
      email,
      source,
      userAgent,
      referrer
    ]);
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 5);
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Email logged successfully'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}
```

4. Replace `YOUR_SPREADSHEET_ID_HERE` with the ID you copied in Step 1
5. Save the project (Ctrl+S) and give it a name like "InfluenceSnap Email Logger"

## Step 3: Deploy the Script

1. Click the "Deploy" button (top right)
2. Click "New deployment"
3. Click the gear icon next to "Type" and select "Web app"
4. Fill in the deployment settings:
   - **Description**: "Email logging endpoint"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
5. Click "Deploy"
6. You may need to authorize the script - click "Authorize access" and follow the prompts
7. Copy the "Web app URL" that appears - you'll need this for the next step

## Step 4: Update Your Website

1. Open `script.js` in your project
2. Find the line: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web app URL you copied in Step 3

## Step 5: Test the Integration

1. Run your website locally: `npm run dev`
2. Submit an email through one of the forms
3. Check your Google Sheet - you should see a new row with the email data

## What Data Gets Logged

The system will automatically log:
- **Timestamp**: When the email was submitted
- **Email**: The user's email address
- **Source**: Which form was used (Hero Section or Final CTA)
- **User Agent**: Browser and device information
- **Referrer**: Where the user came from

## Troubleshooting

### Common Issues:

1. **"Script not authorized" error**: 
   - Go back to Google Apps Script and reauthorize the script

2. **"Spreadsheet not found" error**: 
   - Double-check the spreadsheet ID in your Google Apps Script

3. **Form shows error message**: 
   - Check the browser console for detailed error messages
   - Verify the Web app URL is correct in `script.js`

4. **No data appearing in sheet**: 
   - Make sure the Google Apps Script is deployed as a web app
   - Check that "Who has access" is set to "Anyone"

### Testing the Endpoint Directly

You can test your Google Apps Script endpoint using curl or Postman:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "Hero Section",
    "timestamp": "2025-08-08T12:00:00Z",
    "userAgent": "Test Browser",
    "referrer": "Direct"
  }'
```

## Security Notes

- The Google Apps Script endpoint is public but only accepts POST requests with the expected data format
- No sensitive information is transmitted beyond the email address
- Consider adding rate limiting if you experience spam submissions
- The spreadsheet is only accessible to you and people you explicitly share it with

## Next Steps

Once this is working, you might want to:
- Set up email notifications when new leads come in
- Create automated follow-up sequences
- Export data to your CRM or email marketing platform
- Add data validation and duplicate email checking
