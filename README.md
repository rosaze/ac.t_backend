# ac.t_backend

### 윤지원 윤서빈 (백엔드)

> progress 1:

- 폴더 구조 설치
- npm 설치
- 카카오 로그인 구현, 서버 실행단계까지. 아직 루트 경로 route 지정 안 함

> progress 2:

- 추가한 부분 :
  controller, services 폴더 업데이트. 유저 라우트, 즉 사용자 계정 생성 조회 뿐 만 아니라 프로필 라우트 파일들 추가했어용

- 폴더 구조 설명:

  - userRoutes: 사용자 CRUD 작업 처리
  - profileRoutes: 사용자 프로필 정보 관리
  - app.js:
    주로 앱의 설정 및 초기화, nunjucks 템플릿 엔진을 설정하고, 기본 라우트(/, /users, /comments)를 설정 MongoDB 연결을 설정하고, 요청 로깅 및 정적 파일 제공을 담당
  - server.js:
    환경 변수를 로드하고, MongoDB 연결 설정,body-parser를 사용하여 JSON 요청을 처리.+ API 라우트(/api/auth, /api/survey, /api/recommendations)를 설정.

  이 두 파일 통합할까 말까 고민중

> 앞으로:

- CRUD 정의
- seobin DB 연결

## commit message

- fix: 코드를 수정하거나 버그 수정
- feat: 새로운 기능을 추가했을 때
- chore : 그런트 작업 업데이트, 프로덕션 코드 변경 없음 (실제 프로덕션에 적용되지 않는 도구 변경이나 구성 변경)
- docs: 문서를 추가했을 때
- style: 코드 변경이 아닌 단순 포맷팅 변경 (새미콜론 제거 등)
- refactor: 코드를 리펙토링해서 개선했을 경우
- perf: 성능 개선
- test: 테스트코드를 추가한 경우
