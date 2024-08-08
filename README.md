# ac.t_backend

## 윤지원 윤서빈 (백엔드)

### Progress

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

> progress 3 (8/6):

- 변경사항 : schema 폴더 삭제 후 models 폴더로 통합
- 진행사항 : user에 해당하는 controller, model
- routes, auth 등 완료 및 로그인 passport 완료
- app.js 에 라우터 설정 추가 ( routes 폴더에 index 파일 없어서 관련 삭제)

> progress 4

- (NEW!): 게시판 -POST ( controller, services, routes, models 에서 post 파일 업데이트함 )
- app.js 라우터 통합

> progress 5

- app.js와 loaders/index.js 가 중복 역활하는 것을 발경 -> app.js삭제 후 index.js로 수정
- survey 관련 파일들 삭제후 user에 통합
- mypage/ 개인정보, 맵, 취향, 배지 라우트 생성 후 연결 완료 (맵은 hashtag 반영되도록 했지만 차후에 hashtag 구현하면서 수정 필요함)
- recommend 파일 수정 <- 취향 반영해서 완료함
- .env 파일의 위치로 인한 트러블 슈팅 완료!!!

> progress 6

- 게시물 분류, 해시태그 ( controller, service,route)
- post 의 모델, 서비스, 컨트롤러 수정하여 게시판 분할하고 , 해시태그 기능 추가함.
- getpost 메소드에서 별점 필드 기준으로 후기/자유 게시판 구분하여 조회할수있도록함

> 앞으로:

- CRUD 정의 ( 댓글,메이트)

## commit message

- fix: 코드를 수정하거나 버그 수정
- feat: 새로운 기능을 추가했을 때
- chore : 그런트 작업 업데이트, 프로덕션 코드 변경 없음 (실제 프로덕션에 적용되지 않는 도구 변경이나 구성 변경)
- docs: 문서를 추가했을 때
- style: 코드 변경이 아닌 단순 포맷팅 변경 (새미콜론 제거 등)
- refactor: 코드를 리펙토링해서 개선했을 경우
- perf: 성능 개선
- test: 테스트코드를 추가한 경우
