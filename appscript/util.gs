/**
 * 공통 함수
 */

function jsonResponse(data){

  return ContentService
      .createTextOutput(
        JSON.stringify(data)
      )
      .setMimeType(
        ContentService.MimeType.JSON
      );

}
