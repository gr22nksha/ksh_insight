# ksh_insight
한국사회주택 공급현황

# KSH Insight

> 한국사회주택협회(KSH)의 사회주택 데이터 조회 및 분석 플랫폼

## 프로젝트 소개

KSH Insight는 한국사회주택협회에서 관리하는 사회주택 데이터를
효율적으로 조회, 검색, 분석하기 위한 웹 기반 대시보드입니다.

기존 Google Sheets 기반 데이터를 그대로 활용하면서,
별도의 데이터베이스 구축 없이 실시간 조회와 통계 기능을 제공합니다.

프로젝트의 목표는 단순한 데이터 조회를 넘어
협회의 정책 연구, 회원사 지원, 통계 작성 및 정보 공개를 위한
통합 데이터 플랫폼을 구축하는 것입니다.

---

## 주요 기능

### v0.1 (MVP)

- Google Sheets 연동
- 사회주택 공급현황 조회
- 통합검색
- 다중 필터
- 정렬 및 페이지 처리
- KPI(사업지 수, 공급세대수, 운영기관 수)

### 향후 개발 예정

- 통계 Dashboard
- Chart.js 그래프
- 지도 기반 사업지 조회
- 사업지 상세정보
- 즐겨찾기 검색조건
- URL 공유
- Excel/PDF 다운로드
- 관리자 기능

---

## 기본 조회 규칙

다음 조건은 시스템에서 기본 적용됩니다.

### 준공여부

- 준공
- 미준공
- 미착공
- 종료

### 유형2

- 공공임대 제외

---

## 기술 스택

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- DataTables
- Chart.js

### Backend

- Google Apps Script

### Data

- Google Sheets

---

## 프로젝트 구조

```
ksh_insight/

├── appscript/
│   ├── Code.gs
│   ├── Config.gs
│   └── appsscript.json
│
├── web/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── docs/
│   ├── DataDictionary.md
│   ├── Architecture.md
│   ├── Roadmap.md
│   └── ChangeLog.md
│
└── README.md
```

---

## 개발 원칙

- Google Sheets를 원본 데이터(Source of Truth)로 사용
- 조회 기능을 우선 개발(MVP)
- 단순하고 직관적인 UI
- 점진적 기능 확장
- 모듈화된 코드 구조
- 유지보수와 확장성을 고려한 설계

---

## Roadmap

### Sprint 1

- Google Sheets API
- 기본 조회 화면
- 통합검색

### Sprint 2

- 다중 필터
- KPI
- DataTables

### Sprint 3

- 사업지 상세
- 통계
- 그래프

### Sprint 4

- 지도
- URL 공유
- 즐겨찾기

### Sprint 5

- 관리자 기능
- 데이터 관리
- 사용자 권한

---

## 라이선스

Copyright © Korean Social Housing Association

All Rights Reserved.

---

## 개발

한국사회주택협회(KSH)

Project : **KSH Insight**

```
"사회주택 데이터를 연결하여 정책과 현장을 잇는다."
```