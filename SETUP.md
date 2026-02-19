# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration to store RSVP form submissions.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "RSVP Responses" (or any name you prefer)
4. In the first row (Row 1), add these column headers:
   - **A1**: Timestamp
   - **B1**: Name
   - **C1**: Attending (yes/no)
   - **D1**: Arrival Date (12th March / 13th March / 14th March — only when attending is yes)
   - **E1**: Arrival Time (only when attending is yes)
   - **F1**: Transportation (by train / by road / by air — only when attending is yes)

   When someone selects "No" for attending, only Name and Attending are submitted; Arrival Date, Arrival Time, and Transportation will be empty in the sheet.

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete any default code in the editor
3. Open the file `google-apps-script.js` from this project
4. Copy the entire contents and paste it into the Apps Script editor
5. Save the project (Ctrl+S or Cmd+S)
6. Give it a name like "RSVP Form Handler"

## Step 3: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "RSVP Form Handler" (optional)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important!)
5. Click **Deploy**
6. You may need to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to [Project Name] (unsafe)**
   - Click **Allow**
7. Copy the **Web App URL** - you'll need this in the next step

## Step 4: Configure Your React App

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your Google Apps Script URL:
   ```
   REACT_APP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   Replace `YOUR_SCRIPT_ID` with the actual ID from your Web App URL

3. Restart your React development server:
   ```bash
   npm start
   ```

## Step 5: Test the Integration

1. Open your RSVP portal in the browser
2. Fill out and submit the RSVP form
3. Check your Google Sheet - you should see a new row with the submitted data

## Troubleshooting

### Form submission fails
- Check that your `.env` file has the correct URL
- Make sure you restarted the development server after adding the `.env` file
- Verify the Google Apps Script is deployed with "Anyone" access
- Check the browser console for error messages

### Data not appearing in Google Sheet
- Make sure the sheet name matches (default is usually "Sheet1")
- Check that the Apps Script has permission to edit the sheet
- Verify the script is deployed correctly

### CORS errors
- Make sure the Apps Script is deployed as a Web App (not just saved)
- Verify "Who has access" is set to "Anyone"

## Security Notes

- The Web App URL will be visible in your frontend code
- Anyone with the URL can submit data to your sheet
- Consider adding rate limiting or validation in the Apps Script if needed
- For production, consider adding additional security measures

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the Apps Script execution logs (View > Execution log)
3. Verify all steps were completed correctly
