/**
 * Google Sheets API 호출 모듈
 * Apps Script 배포 서버와 통신
 */

const API = {
  baseUrl: CONFIG.APPS_SCRIPT_URL,

  /**
   * 모든 데이터 페칭
   */
  async fetchAllData() {
    try {
      const response = await fetch(`${this.baseUrl}?action=getAllData`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('fetchAllData error:', error);
      return null;
    }
  },

  /**
   * 특정 범위 데이터 페칭
   */
  async fetchSheetData(sheetName, range) {
    try {
      const params = new URLSearchParams({
        action: 'getSheetData',
        sheet: sheetName,
        range: range
      });
      const response = await fetch(`${this.baseUrl}?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('fetchSheetData error:', error);
      return null;
    }
  },

  /**
   * 데이터 저장
   */
  async saveData(sheetName, row, data) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify({
          action: 'saveData',
          sheet: sheetName,
          row: row,
          data: data
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('saveData error:', error);
      return null;
    }
  },

  /**
   * 요약 통계 데이터
   */
  async fetchSummary() {
    try {
      const response = await fetch(`${this.baseUrl}?action=getSummary`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('fetchSummary error:', error);
      return null;
    }
  },

  /**
   * 필터링된 데이터
   */
  async fetchFiltered(filters) {
    try {
      const params = new URLSearchParams({
        action: 'getFiltered',
        filters: JSON.stringify(filters)
      });
      const response = await fetch(`${this.baseUrl}?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('fetchFiltered error:', error);
      return null;
    }
  }
};
