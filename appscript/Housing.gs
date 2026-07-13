/**
 * Housing.gs
 * 공급현황 조회 API (FIELD 매핑 및 필터 최적화 버전)
 */

function getHousingData() { // 💡 함수명을 code.gs와 일치하도록 getHousingData로 변경
  try {
    // 1. 시트 열기
    const sheet = SpreadsheetApp
        .openById(CONFIG.SPREADSHEET_ID)
        .getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      return {
        success: false,
        message: "시트를 찾을 수 없습니다."
      };
    }

    // 2. 데이터 가져오기
    const values = sheet.getDataRange().getValues();

    if (values.length < 2) {
      return {
        success: true,
        count: 0,
        data: []
      };
    }

    // 3. 헤더 인덱스 매핑
    const headers = values.shift(); // 첫 줄(헤더) 분리
    const headerIndex = {};
    headers.forEach((name, index) => {
      headerIndex[name] = index;
    });

    const result = [];

    // 4. 데이터 로프 및 필터링
    values.forEach(row => {
      // CONFIG.gs에 정의된 필터 기준값 안전하게 가져오기 (헤더 매핑 기반)
      const completionIdx = headerIndex[FIELD.COMPLETION]; // "준공여부" 인덱스
      const type2Idx = headerIndex[FIELD.TYPE2];           // "유형2" 인덱스

      const completion = completionIdx !== undefined ? row[completionIdx] : "";
      const type2 = type2Idx !== undefined ? row[type2Idx] : "";

      // 💡 원래 코드의 기본 필터링 로직 유지 (CONFIG 객체가 존재한다고 가정)
      if (CONFIG.DEFAULT_FILTER && CONFIG.DEFAULT_FILTER.completion) {
        if (!CONFIG.DEFAULT_FILTER.completion.includes(completion)) return;
      }
      if (CONFIG.DEFAULT_FILTER && CONFIG.DEFAULT_FILTER.excludeType2) {
        if (CONFIG.DEFAULT_FILTER.excludeType2.includes(type2)) return;
      }

      // 5. FIELD 규칙에 맞추어 대시보드용 객체 생성
      const obj = {};
      Object.keys(FIELD).forEach(key => {
        const columnName = FIELD[key]; // 예: "주택명", "단체명"
        const colIndex = headerIndex[columnName];
        
        if (colIndex !== undefined && colIndex !== -1) {
          let value = row[colIndex];
          // 날짜 형식 예쁘게 변환
          if (value instanceof Date) {
            value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[key.toLowerCase()] = value; // 대시보드가 읽기 편하게 소문자 key(name, type 등)로 저장
        } else {
          obj[key.toLowerCase()] = "-";
        }
      });

      result.push(obj);
    });

    // 💡 프론트엔드(google.script.run)가 바로 처리할 수 있도록 jsonResponse 래퍼 없이 raw 객체 반환
    return {
      success: true,
      count: result.length,
      data: result
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
