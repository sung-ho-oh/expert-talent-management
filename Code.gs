var PHOTO_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID_HERE"; 

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('전문가 인재풀 시스템')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('시트1') || ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var values = sheet.getRange(2, 1, lastRow - 1, 20).getDisplayValues();
    return values.map(function(row, i) {
      var photoUrl = row[18]; 
      var base64Photo = "";
      if (photoUrl && photoUrl.includes("id=")) {
        try {
          var fileId = photoUrl.split("id=")[1];
          var file = DriveApp.getFileById(fileId);
          var blob = file.getBlob();
          base64Photo = "data:" + blob.getContentType() + ";base64," + Utilities.base64Encode(blob.getBytes());
        } catch(e) { base64Photo = ""; }
      }
      return [i + 2].concat(row).concat([base64Photo]); 
    });
  } catch (e) { return []; }
}

function saveData(formObject) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('시트1') || ss.getSheets()[0];
    var photoUrl = processPhoto(formObject);
    var rowData = [formObject.name, "'" + formObject.birth, "'" + formObject.phone, formObject.address, formObject.email, formObject.education, formObject.career, formObject.orgName, formObject.position, formObject.orgAddress, formObject.cert, formObject.field, formObject.area, formObject.performConsult, formObject.performEval, formObject.performLecture, formObject.performBook, formObject.performPaper, photoUrl, formObject.agree];
    sheet.appendRow(rowData);
    return "성공: 등록되었습니다.";
  } catch (e) { return "오류: " + e.toString(); }
}

function processPhoto(formObject) {
  if (formObject.photoData) {
    var folder = DriveApp.getFolderById(PHOTO_FOLDER_ID);
    var decodedData = Utilities.base64Decode(formObject.photoData);
    var blob = Utilities.newBlob(decodedData, formObject.photoMime, formObject.photoName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  }
  return "";
}
