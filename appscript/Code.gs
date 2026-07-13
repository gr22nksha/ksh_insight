/**
 * Apps Script Code.gs
 * HTTP 엔드포인트 - doGet/doPost 처리
 */

function doGet(e) {
  const action = e.parameter.action;

  // 1. action 파라미터가 있으면 JSON API 응답
  if (action) {
    try {
      let response;

      switch (action) {
        case 'getAllData':
          response = handleGetAllData();
          break;

        case 'getSheetData':
          response = handleGetSheetData(e.parameter);
          break;

        case 'getSummary':
          response = handleGetSummary();
          break;

        case 'getFiltered':
          response = handleGetFiltered(e.parameter);
          break;

        default:
          response = {
            success: false,
            error: `Unknown action: ${action}`
          };
      }

      // 로그 기록 (유틸 함수가 구현되어 있다고 가정)
      if (typeof writeLog === 'function') {
        writeLog(action, 'GET', JSON.stringify(e.parameter));
      }
      
      // JSON 출력 반환
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      const errorMsg = error.toString();
      if (typeof writeLog === 'function') {
        writeLog(action, 'ERROR', errorMsg);
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: errorMsg,
        stack: error.stack
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 2. action이 없으면 메인 HTML 대시보드 화면 반환 (평가식 템플릿 사용 권장)
// HtmlService 템플릿 평가식(evaluate)을 사용하여 렌더링하도록 변경
return HtmlService.createTemplateFromFile('index')
  .evaluate()
  .setTitle('KSH Insight Dashboard')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    let response;

    switch (action) {
      case 'saveData':
        response = handleSaveData(postData);
        break;

      default:
        response = {
          success: false,
          error: `Unknown POST action: ${action}`
        };
    }

    if (typeof writeLog === 'function') {
      writeLog(action, 'POST', JSON.stringify(postData));
    }
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorMsg = error.toString();
    if (typeof writeLog === 'function') {
      writeLog('UNKNOWN', 'ERROR', errorMsg);
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: errorMsg
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET: 모든 데이터 조회
 */
function handleGetAllData() {
  const cacheKey = getCacheKey('getAllData');
  const cached = getCachedData(cacheKey);

  if (cached) {
    return { success: true, data: cached, cached: true };
  }

  // 💡 기존의 HousingData.getAll() 대신 housing.gs의 getHousingData()를 호출합니다.
  const response = getHousingData(); 
  const data = (response && response.success) ? response.data : [];

  setCachedData(cacheKey, data);

  return {
    success: true,
    data: data,
    count: data.length,
    cached: false
  };
}

/**
 * GET: 특정 시트 데이터 조회
 */
function handleGetSheetData(params) {
  const sheetName = params.sheet;
  const range = params.range || 'A:F';

  if (!sheetName) {
    return {
      success: false,
      error: 'sheet parameter required'
    };
  }

  const data = HousingData.getByRange(sheetName, range);

  return {
    success: true,
    sheet: sheetName,
    data: data,
    count: data.length
  };
}

/**
 * GET: 요약 통계
 */
function handleGetSummary() {
  const cacheKey = getCacheKey('getSummary');
  const cached = getCachedData(cacheKey);

  if (cached) {
    return { success: true, summary: cached, cached: true };
  }

  // 💡 마찬가지로 getHousingData() 결과물의 개수를 기반으로 요약 통계를 생성합니다.
  const response = getHousingData();
  const data = (response && response.success) ? response.data : [];
  
  const summary = {
    "총 건수": data.length,
    "기준 일자": Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")
  };

  setCachedData(cacheKey, summary);

  return {
    success: true,
    summary: summary,
    cached: false
  };
}

/**
 * GET: 필터링 조회
 */
function handleGetFiltered(params) {
  const filters = JSON.parse(params.filters || '{}');
  const data = HousingData.getFiltered(filters);

  return {
    success: true,
    data: data,
    count: data.length,
    filters: filters
  };
}

/**
 * POST: 데이터 저장
 */
function handleSaveData(postData) {
  const sheetName = postData.sheet;
  const row = postData.row;
  const data = postData.data;

  if (!sheetName || !row || !data) {
    return {
      success: false,
      error: 'sheet, row, data parameters required'
    };
  }

  const result = HousingData.saveRow(sheetName, row, data);

  // 캐시 무효화
  const cacheKeys = [
    getCacheKey('getAllData'),
    getCacheKey('getSummary')
  ];
  cacheKeys.forEach(key => {
    CacheService.getScriptCache().remove(key);
  });

  return {
    success: result,
    message: result ? 'Data saved' : 'Failed to save data',
    sheet: sheetName,
    row: row
  };
}

// 💡 보조 함수 예시 (기존 파일에 따로 없다면 에러 방지용으로 유지)
function getCacheKey(action) {
  return "cache_" + action;
}
function getCachedData(key) {
  const cached = CacheService.getScriptCache().get(key);
  return cached ? JSON.parse(cached) : null;
}
function setCachedData(key, data) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(data), 21600); // 6시간 캐시
  } catch(e) {}
}
