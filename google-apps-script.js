/**
 * Google Apps Script for RSVP Form Submission
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name it "RSVP Responses" (or any name you prefer)
 * 3. In the first row, add these headers: Timestamp, Name, Attending, Arrival Date, Arrival Time, Transportation
 * 4. Go to Extensions > Apps Script
 * 5. Delete the default code and paste this entire file
 * 6. Replace 'YOUR_SHEET_NAME' with your actual sheet name (default is usually "Sheet1")
 * 7. Click "Deploy" > "New deployment"
 * 8. Click the gear icon and select "Web app"
 * 9. Set Execute as: "Me"
 * 10. Set Who has access: "Anyone"
 * 11. Click "Deploy"
 * 12. Copy the Web App URL and use it in your React app's .env file
 */

function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // If the sheet is empty, add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Attending', 'Arrival Date', 'Arrival Time', 'Transportation']);
    }
    
    // Parse the incoming data (form-urlencoded comes in e.parameter)
    const data = e.parameter || {};
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Prepare the row data
    const rowData = [
      timestamp,
      data.name || '',
      data.attending || '',
      data.arrivalDate || '',
      data.arrivalTime || '',
      data.transportation || ''
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'RSVP submitted successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error submitting RSVP: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Handle OPTIONS preflight requests (required for CORS from browsers)
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Test function (optional - for testing in Apps Script editor)
function testDoPost() {
  const mockEvent = {
    parameter: {
      name: 'Test User',
      attending: 'yes',
      arrivalDate: '13th March',
      arrivalTime: '14:00',
      transportation: 'by train'
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
