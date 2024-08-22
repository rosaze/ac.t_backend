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

> progress 7

- postcontorller에서 user로 해시태그 (location / activity)저장 되도록 수정
- 자신의 취향 + 가보지 않은 것 반영해서 추천 기능 완료
- 배지 지급 (location) 5번 이상 방문 시 "도시 이름" master로 일단 만들어 놓음
- map : 5번까지 점차 색상이 변하는 로직 구현 완료

> progress 8

- 메이트 모집 게시글 작성, 게시글 정렬(사용자 임의로)
- 채팅방 입장 및 나가기 구현
- 채팅방 메세지 전송 및 수신, 채팅방 생성 및 참여 (socket.io 로 실시간 통신 )

> progress 9

- profile 파일 제거 : user파일을 사용해서 마이페이지 내 profile 대체
- activityAnalysis, activityRecommend, preference service 를 나누어 활동 추천, 선호도 변경, 활동 데이터 분석 등 기능 분리
- post 에서 각 후기의 요약 기능 제공 및 장소 + 활동의 전체 후기글에 대해 감정 분석 결과 제공 기능(koGPT)

> progress 10

- 스토어 기능 구축 (상품 목록 조회, 상품 상세 조회 , 상품 관리 -관리자용 )

> progress 11

- 뱃지 지급 구현 완료(ai 이미지 생성 관련 제외, ai 구현 완료 후 구현할 예정)
- <숙박검색>
  - VendorService.js: getAccommodationsByRegion 메서드 추가. 숙박시설을 시군구별, 숙박유형으로 필터링.
- AccomodationController.js: 숙박 카테고리 필터링
- <액티비티 검색>

  - vendorController,vendorservice 에서 확인
  - 장소 검색 시 감정 분석 결과: 사용자가 특정 장소를 검색하면, 그 장소와 연관된 후기 게시물의 해시태그(특히 업체명 해시태그)를 통해 PostService에서 감정 분석을 수행하고 결과를 반환
  - 검색기록 : SearchHistory.js , vendorService에서 검색기록 모델 불러와서 사용자 추천 로직과 검색 기록을 관리하는 메서드 추가.

- <스토어&결제>
  - activity.json 파일 통해서 카테고리 분류
  - 스토어 랜탈 / 상품, 티켓 구매 파일 분리
  - 장바구니 기능 추가
  - 토스페이 적용 but 추후 사업자 등록 후 수정 예정

> progress 12
- 멘토멘티 게시판 생성 및 chat 원래 파일과 연결, 유료결제 부분은 추후 회의
- 개인프로필 전달 api 생성완료

> 앞으로:

- 논의 : loaders 폴더에서 초기화 작업 관리하고 ( socket.js , mongoose.js 해서 연결파일 추가) app.js는 서버 실행에만 집중. app.js 를 간결히 하는게 맞는지 , 아니면 이대로 분리. 이대로 간다면 loaders/index,js 는 app.js 와 상당히 많은 부분 겹침

- CRUD 정의 ( 댓글)
- utils/activity.js 내에 액티비티 리스트 정리
- 코드 내에 서버 연결 및 데이터 추가되었을 시 콘솔에 에러 메세지 뜨도록 전체적인 코드 수정 필요 이후 테스트 한반 진행 후 다시 시작~~

## commit message

- fix: 코드를 수정하거나 버그 수정
- feat: 새로운 기능을 추가했을 때
- chore : 그런트 작업 업데이트, 프로덕션 코드 변경 없음 (실제 프로덕션에 적용되지 않는 도구 변경이나 구성 변경)
- docs: 문서를 추가했을 때
- style: 코드 변경이 아닌 단순 포맷팅 변경 (새미콜론 제거 등)
- refactor: 코드를 리펙토링해서 개선했을 경우
- perf: 성능 개선
- test: 테스트코드를 추가한 경우
