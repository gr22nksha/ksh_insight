/**
 * UI 렌더링 모듈
 * DOM 조작, 컴포넌트 생성, 스타일링 전담
 */

const UI = {
  /**
   * 헤더 컴포넌트
   */
  createHeader(lastUpdate) {
    const header = document.createElement('header');
    header.className = 'dashboard-header';
    
    const updateText = lastUpdate 
      ? formatDate(lastUpdate, CONFIG.DATETIME_FORMAT)
      : '데이터 없음';

    header.innerHTML = `
      <div class="header-content">
        <h1>${CONFIG.LABELS.title}</h1>
        <div class="header-actions">
          <input 
            type="text" 
            id="search-input" 
            class="search-input" 
            placeholder="${CONFIG.LABELS.search}"
          />
          <button id="refresh-btn" class="btn btn-primary" title="데이터 새로고침">
            🔄 ${CONFIG.LABELS.refresh}
          </button>
          <button id="export-btn" class="btn btn-secondary" title="CSV로 내보내기">
            📥 ${CONFIG.LABELS.export}
          </button>
        </div>
        <div class="header-meta">
          <small>마지막 업데이트: ${updateText}</small>
        </div>
      </div>
    `;
    
    return header;
  },

  /**
   * 요약 카드 섹션
   */
  createSummarySection(summary) {
    const section = document.createElement('section');
    section.className = 'summary-section';

    if (!summary || Object.keys(summary).length === 0) {
      section.innerHTML = '<p class="no-data">요약 데이터가 없습니다</p>';
      return section;
    }

    const cards = Object.entries(summary)
      .map(([key, value]) => this.createSummaryCard(key, value))
      .join('');

    section.innerHTML = `<div class="summary-cards">${cards}</div>`;
    return section;
  },

  /**
   * 개별 요약 카드
   */
  createSummaryCard(label, value) {
    const formattedValue = UI.formatSummaryValue(label, value);
    return `
      <div class="summary-card">
        <h3>${label}</h3>
        <p class="summary-value">${formattedValue}</p>
      </div>
    `;
  },

  /**
   * 요약값 포맷팅
   */
  formatSummaryValue(label, value) {
    if (typeof value !== 'number') return value;

    if (label.includes('금액') || label.includes('가격')) {
      return formatCurrency(value);
    }
    if (label.includes('율') || label.includes('비율')) {
      return formatPercent(value / 100);
    }
    if (value > 1000) {
      return formatNumber(value);
    }
    return value;
  },

  /**
   * 필터 섹션
   */
  createFilterSection() {
    const section = document.createElement('section');
    section.className = 'filters-section';
    section.innerHTML = `
      <div class="filter-group">
        <label for="sort-select">정렬:</label>
        <select id="sort-select" class="sort-select">
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="popular">인기순</option>
          <option value="az">가나다순</option>
        </select>
      </div>
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">전체</button>
        <button class="filter-btn" data-filter="recent">최근</button>
        <button class="filter-btn" data-filter="active">활성</button>
      </div>
    `;
    return section;
  },

  /**
   * 데이터 테이블 컴포넌트
   */
  createTable(data) {
    const section = document.createElement('section');
    section.className = 'table-section';

    if (!data || data.length === 0) {
      section.innerHTML = `<div class="empty-state"><p>${CONFIG.LABELS.noData}</p></div>`;
      return section;
    }

    const headers = Object.keys(data[0]);
    const tableHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              ${headers.map(header => `
                <th class="sortable" data-column="${header}">
                  ${header}
                  <span class="sort-icon">⬍</span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => `
              <tr class="table-row" data-index="${idx}">
                ${headers.map(header => `
                  <td>${UI.formatCellValue(row[header])}</td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    section.innerHTML = tableHTML;
    return section;
  },

  /**
   * 셀 값 포맷팅
   */
  formatCellValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' && value.length === 0) return '-';
    if (typeof value === 'number' && value > 1000) return formatNumber(value);
    if (value instanceof Date) return formatDate(value);
    return String(value);
  },

  /**
   * 페이지네이션 컴포넌트
   */
  createPagination(currentPage, totalPages, onPageChange) {
    const section = document.createElement('section');
    section.className = 'pagination-section';

    if (totalPages <= 1) {
      section.style.display = 'none';
      return section;
    }

    let paginationHTML = '';

    // 이전 버튼
    if (currentPage > 1) {
      paginationHTML += `
        <button class="page-btn prev-btn" data-page="${currentPage - 1}">
          ← 이전
        </button>
      `;
    }

    // 페이지 번호
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) paginationHTML += `<span class="page-gap">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      const active = i === currentPage ? ' active' : '';
      paginationHTML += `
        <button class="page-btn${active}" data-page="${i}">${i}</button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) paginationHTML += `<span class="page-gap">...</span>`;
      paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // 다음 버튼
    if (currentPage < totalPages) {
      paginationHTML += `
        <button class="page-btn next-btn" data-page="${currentPage + 1}">
          다음 →
        </button>
      `;
    }

    section.innerHTML = `
      <div class="pagination">
        <div class="pagination-buttons">
          ${paginationHTML}
        </div>
        <span class="page-info">
          페이지 ${currentPage} / ${totalPages}
        </span>
      </div>
    `;

    // 페이지 버튼 이벤트
    section.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        onPageChange(page);
      });
    });

    return section;
  },

  /**
   * 로딩 스피너
   */
  createLoadingState() {
    const container = document.createElement('div');
    container.className = 'loading-state';
    container.innerHTML = `
      <div class="spinner"></div>
      <p>${CONFIG.LABELS.loading}</p>
    `;
    return container;
  },

  /**
   * 에러 상태
   */
  createErrorState(message = CONFIG.LABELS.error) {
    const container = document.createElement('div');
    container.className = 'error-state';
    container.innerHTML = `
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="App.loadData()">
        다시 시도
      </button>
    `;
    return container;
  },

  /**
   * 통계 차트 컨테이너
   */
  createChartSection(title) {
    const section = document.createElement('section');
    section.className = 'chart-section';
    section.innerHTML = `
      <h2>${title}</h2>
      <div id="chart-container" class="chart-container" style="height: ${CONFIG.DASHBOARD.chartHeight}px;"></div>
    `;
    return section;
  },

  /**
   * 모달 컴포넌트
   */
  createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'app-modal';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', () => modal.remove());

    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = `
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" aria-label="닫기">&times;</button>
      </div>
      <div class="modal-body">
        ${typeof content === 'string' ? content : ''}
      </div>
      <div class="modal-footer">
        ${actions.map(action => `
          <button class="btn btn-${action.type || 'secondary'}" data-action="${action.id}">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;

    if (typeof content !== 'string' && content instanceof HTMLElement) {
      dialog.querySelector('.modal-body').appendChild(content);
    }

    dialog.querySelector('.modal-close').addEventListener('click', () => modal.remove());

    actions.forEach(action => {
      const btn = dialog.querySelector(`[data-action="${action.id}"]`);
      if (btn && action.callback) {
        btn.addEventListener('click', () => {
          action.callback();
          modal.remove();
        });
      }
    });

    modal.appendChild(backdrop);
    modal.appendChild(dialog);

    return modal;
  },

  /**
   * 토스트 알림
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.animation = `slideIn ${CONFIG.DASHBOARD.animationDuration}ms ease-out`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = `slideOut ${CONFIG.DASHBOARD.animationDuration}ms ease-in`;
      setTimeout(() => toast.remove(), CONFIG.DASHBOARD.animationDuration);
    }, duration);
  },

  /**
   * 전체 대시보드 렌더링
   */
  renderDashboard(data, summary, currentPage, totalPages, lastUpdate) {
    const main = document.querySelector('main') || document.body;
    main.innerHTML = '';

    // 헤더
    main.appendChild(this.createHeader(lastUpdate));

    // 요약
    main.appendChild(this.createSummarySection(summary));

    // 필터
    main.appendChild(this.createFilterSection());

    // 테이블
    main.appendChild(this.createTable(data));

    // 페이지네이션
    main.appendChild(this.createPagination(currentPage, totalPages, (page) => {
      App.goToPage(page);
    }));
  },

  /**
   * 컨테이너 초기화
   */
  initContainer() {
    let main = document.querySelector('main');
    if (!main) {
      main = document.createElement('main');
      main.id = 'dashboard-container';
      document.body.appendChild(main);
    }
    return main;
  }
};
