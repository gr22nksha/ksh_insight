/**
 * KSH Insight Dashboard - 메인 앱
 * UI 렌더링, 상태 관리, 이벤트 핸들링
 */

const App = {
  // 상태
  state: {
    data: [],
    summary: {},
    currentPage: 1,
    filter: {},
    isLoading: false,
    lastUpdate: null
  },

  // 초기화
  async init() {
    console.log('App initializing...');
    this.setupDOM();
    this.attachEventListeners();
    await this.loadData();
    this.startAutoRefresh();
  },

  // DOM 요소 설정
  setupDOM() {
    const main = document.querySelector('main');
    if (!main) {
      const body = document.body;
      const newMain = document.createElement('main');
      newMain.id = 'dashboard-container';
      body.appendChild(newMain);
    }
  },

  // 이벤트 리스너 등록
  attachEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      const refreshBtn = document.getElementById('refresh-btn');
      if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadData());

      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

      const filterBtns = document.querySelectorAll('[data-filter]');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => this.handleFilter(e.target.dataset.filter));
      });
    });
  },

  // 데이터 로드
  async loadData() {
    this.state.isLoading = true;
    this.showLoading();

    const data = await API.fetchAllData();
    const summary = await API.fetchSummary();

    if (data && summary) {
      this.state.data = data;
      this.state.summary = summary;
      this.state.lastUpdate = new Date();
      this.render();
      console.log(`Data loaded: ${data.length} items`);
    } else {
      this.showError('데이터를 불러올 수 없습니다');
    }

    this.state.isLoading = false;
  },

  // 자동 새로고침
  startAutoRefresh() {
    setInterval(() => {
      this.loadData();
    }, CONFIG.DASHBOARD.refreshInterval);
  },

  // 메인 렌더링
  render() {
    const main = document.querySelector('main') || document.body;
    main.innerHTML = '';

    // 헤더
    main.appendChild(this.renderHeader());

    // 요약 카드
    main.appendChild(this.renderSummary());

    // 필터
    main.appendChild(this.renderFilters());

    // 데이터 테이블
    main.appendChild(this.renderTable());

    // 페이지네이션
    main.appendChild(this.renderPagination());
  },

  // 헤더 렌더링
  renderHeader() {
    const header = document.createElement('header');
    header.className = 'dashboard-header';
    header.innerHTML = `
      <div class="header-content">
        <h1>${CONFIG.LABELS.title}</h1>
        <div class="header-actions">
          <button id="refresh-btn" class="btn btn-primary">
            <span>🔄</span> ${CONFIG.LABELS.refresh}
          </button>
          <button id="export-btn" class="btn btn-secondary">
            <span>📥</span> ${CONFIG.LABELS.export}
          </button>
          <div class="last-update">
            마지막 업데이트: ${this.state.lastUpdate ? formatDate(this.state.lastUpdate, CONFIG.DATETIME_FORMAT) : '-'}
          </div>
        </div>
      </div>
    `;
    return header;
  },

  // 요약 카드 렌더링
  renderSummary() {
    const summary = this.state.summary;
    const container = document.createElement('section');
    container.className = 'summary-section';
    
    const cards = Object.entries(summary).map(([key, value]) => {
      const card = document.createElement('div');
      card.className = 'summary-card';
      card.innerHTML = `
        <h3>${key}</h3>
        <p class="summary-value">${this.formatSummaryValue(key, value)}</p>
      `;
      return card;
    }).join('');

    container.innerHTML = `<div class="summary-cards">${cards}</div>`;
    return container;
  },

  // 요약값 포맷팅
  formatSummaryValue(key, value) {
    if (typeof value === 'number') {
      if (key.includes('금액') || key.includes('가격')) return formatCurrency(value);
      if (key.includes('율') || key.includes('비율')) return formatPercent(value / 100);
      return formatNumber(value);
    }
    return value;
  },

  // 필터 렌더링
  renderFilters() {
    const filters = document.createElement('section');
    filters.className = 'filters-section';
    filters.innerHTML = `
      <div class="filter-group">
        <input 
          type="text" 
          id="search-input" 
          class="search-input" 
          placeholder="${CONFIG.LABELS.search}"
        />
      </div>
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">전체</button>
        <button class="filter-btn" data-filter="recent">최근</button>
        <button class="filter-btn" data-filter="popular">인기</button>
      </div>
    `;
    return filters;
  },

  // 테이블 렌더링
  renderTable() {
    const table = document.createElement('section');
    table.className = 'table-section';

    if (!this.state.data || this.state.data.length === 0) {
      table.innerHTML = `<p class="no-data">${CONFIG.LABELS.noData}</p>`;
      return table;
    }

    const filteredData = this.getFilteredData();
    const pageData = this.getPaginatedData(filteredData);

    const tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            ${Object.keys(pageData[0] || {}).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${pageData.map(row => `
            <tr>
              ${Object.values(row).map(value => `<td>${this.formatCellValue(value)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    table.innerHTML = tableHTML;
    return table;
  },

  // 셀 값 포맷팅
  formatCellValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number' && value > 1000) return formatNumber(value);
    if (value instanceof Date) return formatDate(value);
    return String(value);
  },

  // 페이지네이션 렌더링
  renderPagination() {
    const pagination = document.createElement('section');
    pagination.className = 'pagination-section';

    const filteredData = this.getFilteredData();
    const totalPages = Math.ceil(filteredData.length / CONFIG.DASHBOARD.pageSize);
    const currentPage = this.state.currentPage;

    let paginationHTML = '';
    if (currentPage > 1) {
      paginationHTML += `<button class="page-btn" onclick="App.goToPage(${currentPage - 1})">← 이전</button>`;
    }

    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      const active = i === currentPage ? ' active' : '';
      paginationHTML += `<button class="page-btn${active}" onclick="App.goToPage(${i})">${i}</button>`;
    }

    if (currentPage < totalPages) {
      paginationHTML += `<button class="page-btn" onclick="App.goToPage(${currentPage + 1})">다음 →</button>`;
    }

    pagination.innerHTML = `
      <div class="pagination">
        ${paginationHTML}
        <span class="page-info">페이지 ${currentPage} / ${totalPages}</span>
      </div>
    `;

    return pagination;
  },

  // 필터링된 데이터 반환
  getFilteredData() {
    return this.state.data.filter(item => {
      for (let [key, value] of Object.entries(this.state.filter)) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  },

  // 페이지네이션 적용 데이터 반환
  getPaginatedData(data) {
    const start = (this.state.currentPage - 1) * CONFIG.DASHBOARD.pageSize;
    const end = start + CONFIG.DASHBOARD.pageSize;
    return data.slice(start, end);
  },

  // 페이지 이동
  goToPage(page) {
    this.state.currentPage = page;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // 검색 핸들러
  handleSearch(query) {
    if (!query) {
      this.state.filter = {};
    } else {
      this.state.filter = {
        search: query
      };
    }
    this.state.currentPage = 1;
    this.render();
  },

  // 필터 핸들러
  handleFilter(filterType) {
    this.state.filter = { type: filterType };
    this.state.currentPage = 1;
    this.render();

    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filterType);
    });
  },

  // 로딩 표시
  showLoading() {
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `<div class="loading">${CONFIG.LABELS.loading}</div>`;
  },

  // 에러 표시
  showError(message) {
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `<div class="error">${message}</div>`;
  },

  // 데이터 내보내기
  exportData() {
    const data = this.getFilteredData();
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ksh-insight-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  },

  // CSV 변환
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csv.push(values.join(','));
    });

    return csv.join('\n');
  }
};

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
