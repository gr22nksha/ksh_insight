/**
 * 프로젝트 설정 파일
 * Apps Script 배포 URL, Sheets ID 등 환경 변수
 */

const CONFIG = {
  // Apps Script 웹 앱 배포 URL
  // Code.gs의 doGet/doPost를 배포한 URL로 변경하세요
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwNR8TyNbOfInMYTh6-1SsVdrmZJ7Mxm7ue6jwqMOH7IUdwRnDumJDoK-VEjbOwqHmf/userweb?v=1',
  // Google Sheets ID
  SHEET_ID: '1yX14R6IwkXMXel1TB7W1X5HPLwWoImYJus_pitE1lgg',

  // 시트 이름 매핑
  SHEETS: {
    HOUSING: '주택', // 주택 데이터 시트
    CONFIG: '설정',   // 설정 시트
    LOG: '로그'       // 로그 시트
  },

  // 대시보드 설정
  DASHBOARD: {
    refreshInterval: 5 * 60 * 1000, // 5분마다 새로고침
    pageSize: 20,                    // 페이지당 아이템 수
    chartHeight: 300,                // 차트 높이 (px)
    animationDuration: 300           // 애니메이션 (ms)
  },

  // UI 텍스트
  LABELS: {
    title: 'KSH Insight Dashboard',
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    noData: '데이터가 없습니다',
    refresh: '새로고침',
    export: '내보내기',
    search: '검색'
  },

  // 날짜 포맷
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',

  // 통화 포맷
  CURRENCY: 'KRW'
};

/**
 * 유틸리티: 날짜 포맷팅
 */
function formatDate(date, format = CONFIG.DATE_FORMAT) {
  if (!(date instanceof Date)) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * 유틸리티: 숫자 포맷팅 (화폐)
 */
function formatCurrency(value) {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: CONFIG.CURRENCY,
    minimumFractionDigits: 0
  }).format(value);
}

/**
 * 유틸리티: 숫자 포맷팅 (천 단위)
 */
function formatNumber(value) {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 유틸리티: 백분율 포맷팅
 */
function formatPercent(value, decimals = 1) {
  if (typeof value !== 'number') return '';
  return (value * 100).toFixed(decimals) + '%';
}
