const CONFIG = {

  // Google Spreadsheet ID
  SPREADSHEET_ID: "1yX14R6IwkXMXel1TB7W1X5HPLwWoImYJus_pitE1lgg",

  // 시트명
  SHEET_NAME: "공급현황db",

  // 기본 조회 조건
  DEFAULT_FILTER: {
    completion: [
      "준공",
      "미준공",
      "미착공",
      "종료"
    ],

    excludeType2: [
      "공공임대"
    ]
  }

};

const FIELD = {
  ID: "NO",
  NAME: "주택명",
  ORGANIZATION: "단체명",
  REGION: "광역",
  DISTRICT: "자치구",
  TYPE: "유형",
  TYPE2: "유형2",
  STATUS: "운영상태",
  COMPLETION: "준공여부",
  HOUSEHOLDS: "세대",
  ADDRESS: "위치",
  LAT: "위도",
  LNG: "경도",
  NOTE: "비고",
  YEAR: "심사연도"
};
