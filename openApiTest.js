const axios = require("axios");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const serviceKey = process.env.TOURISM_API_KEY;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const sigunguMap = {
  1: "강릉시",
  2: "고성군",
  3: "동해시",
  4: "삼척시",
  5: "속초시",
  6: "양구군",
  7: "양양군",
  8: "영월군",
  9: "원주시",
  10: "인제군",
  11: "정선군",
  12: "철원군",
  13: "춘천시",
  14: "태백시",
  15: "평창군",
  16: "홍천군",
  17: "화천군",
  18: "횡성군",
};

const contentTypeMap = {
  12: "관광지",
  14: "문화시설",
  15: "축제/공연/행사",
  25: "여행코스",
  28: "레포츠",
  32: "숙박",
  38: "쇼핑",
  39: "음식",
};

const categoryMap = {
  // 자연 관광지
  A01: "자연",
  A0101: "자연관광지",
  A01010100: "국립공원",
  A01010200: "도립공원",
  A01010300: "군립공원",
  A01010400: "산",
  A01010500: "자연생태관광지",
  A01010600: "자연휴양림",
  A01010700: "수목원",
  A01010800: "폭포",
  A01010900: "계곡",
  A01011000: "약수터",
  A01011100: "해안절경",
  A01011200: "해수욕장",
  A01011300: "섬",
  A01011400: "항구/포구",
  A01011600: "등대",
  A01011700: "호수",
  A01011800: "강",
  A01011900: "동굴",
  A0102: "관광자원",
  A01020100: "희귀동.식물",
  A01020200: "기암괴석",

  // 인문 관광지
  A02: "인문(문화/예술/역사)",
  A0201: "역사관광지",
  A02010100: "고궁",
  A02010200: "성",
  A02010300: "문",
  A02010400: "고택",
  A02010500: "생가",
  A02010600: "민속마을",
  A02010700: "유적지/사적지",
  A02010800: "사찰",
  A02010900: "종교성지",
  A02011000: "안보관광",
  A0202: "휴양관광지",
  A02020200: "관광단지",
  A02020300: "온천/욕장/스파",
  A02020400: "이색찜질방",
  A02020500: "헬스투어",
  A02020600: "테마공원",
  A02020700: "공원",
  A02020800: "유람선/잠수함관광",
  A0203: "체험관광지",
  A02030100: "농.산.어촌 체험",
  A02030200: "전통체험",
  A02030300: "산사체험",
  A02030400: "이색체험",
  A02030600: "이색거리",
  A0204: "산업관광지",
  A02040400: "발전소",
  A02040600: "식음료",
  A02040800: "기타",
  A02040900: "전자-반도체",
  A02041000: "자동차",
  A0205: "건축/조형물",
  A02050100: "다리/대교",
  A02050200: "기념탑/기념비/전망대",
  A02050300: "분수",
  A02050400: "동상",
  A02050500: "터널",
  A02050600: "유명건물",
  A0206: "문화시설",
  A02060100: "박물관",
  A02060200: "기념관",
  A02060300: "전시관",
  A02060400: "컨벤션센터",
  A02060500: "미술관/화랑",
  A02060600: "공연장",
  A02060700: "문화원",
  A02060800: "외국문화원",
  A02060900: "도서관",
  A02061000: "대형서점",
  A02061100: "문화전수시설",
  A02061200: "영화관",
  A02061300: "어학당",
  A02061400: "학교",
  A0207: "축제",
  A02070100: "문화관광축제",
  A02070200: "일반축제",
  A0208: "공연/행사",
  A02080100: "전통공연",
  A02080200: "연극",
  A02080300: "뮤지컬",
  A02080400: "오페라",
  A02080500: "전시회",
  A02080600: "박람회",
  A02080800: "무용",
  A02080900: "클래식음악회",
  A02081000: "대중콘서트",
  A02081100: "영화",
  A02081200: "스포츠경기",
  A02081300: "기타행사",

  // 추천코스
  C01: "추천코스",
  C0112: "가족코스",
  C0113: "나홀로코스",
  C0114: "힐링코스",
  C0115: "도보코스",
  C0116: "캠핑코스",
  C0117: "맛코스",

  // 레포츠
  A03: "레포츠",
  A0301: "레포츠소개",
  A03010200: "수상레포츠",
  A03010300: "항공레포츠",
  A0302: "육상 레포츠",
  A03020200: "수련시설",
  A03020300: "경기장",
  A03020400: "인라인(실내 인라인 포함)",
  A03020500: "자전거하이킹",
  A03020600: "카트",
  A03020700: "골프",
  A03020800: "경마",
  A03020900: "경륜",
  A03021000: "카지노",
  A03021100: "승마",
  A03021200: "스키/스노보드",
  A03021300: "스케이트",
  A03021400: "썰매장",
  A03021500: "수렵장",
  A03021600: "사격장",
  A03021700: "야영장,오토캠핑장",
  A03021800: "암벽등반",
  A03022000: "서바이벌게임",
  A03022100: "ATV",
  A03022200: "MTB",
  A03022300: "오프로드",
  A03022400: "번지점프",
  A03022600: "스키(보드) 렌탈샵",
  A03022700: "트래킹",
  A0303: "수상 레포츠",
  A03030100: "윈드서핑/제트스키",
  A03030200: "카약/카누",
  A03030300: "요트",
  A03030400: "스노쿨링/스킨스쿠버다이빙",
  A03030500: "민물낚시",
  A03030600: "바다낚시",
  A03030700: "수영",
  A03030800: "래프팅",
  A0304: "항공 레포츠",
  A03040100: "스카이다이빙",
  A03040200: "초경량비행",
  A03040300: "헹글라이딩/패러글라이딩",
  A03040400: "열기구",
  A0305: "복합 레포츠",
  A03050100: "복합 레포츠",
  // 숙박
  B02: "숙박",
  B0201: "숙박시설",
  B02010100: "관광호텔",
  B02010500: "콘도미니엄",
  B02010600: "유스호스텔",
  B02010700: "펜션",
  B02010900: "모텔",
  B02011000: "민박",
  B02011100: "게스트하우스",
  B02011200: "홈스테이",
  B02011300: "서비스드레지던스",
  B02011600: "한옥",
  A04: "쇼핑",
  A0401: "쇼핑",
  A04010100: "5일장",
  A04010200: "상설시장",
  A04010300: "백화점",
  A04010400: "면세점",
  A04010500: "대형마트",
  A04010600: "전문매장/상가",
  A04010700: "공예/공방",
  A04010900: "특산물판매점",
  A04011000: "사후면세점",
  A05: "음식",
  A0502: "음식점",
  A05020100: "한식",
  A05020200: "서양식",
  A05020300: "일식",
  A05020400: "중식",
  A05020700: "이색음식점",
  A05020900: "카페/전통찻집",
  A05021000: "클럽",
};
async function fetchAndStoreLocations() {
  try {
    await client.connect();
    const database = client.db("actapp");
    const collection = database.collection("Vendors");

    const areaCode = 32; // 강원도 코드

    // 시군구 코드를 먼저 받아옴
    const sigunguResponse = await axios.get(
      "http://apis.data.go.kr/B551011/KorService1/areaCode1",
      {
        params: {
          serviceKey: serviceKey,
          areaCode: areaCode,
          numOfRows: 50, // 필요한 경우 조정 가능
          pageNo: 1,
          MobileOS: "ETC",
          MobileApp: "AppTest",
          _type: "json",
        },
      }
    );

    // 응답 데이터가 예상한 구조인지 확인하고 처리
    if (
      sigunguResponse.data &&
      sigunguResponse.data.response &&
      sigunguResponse.data.response.body &&
      sigunguResponse.data.response.body.items
    ) {
      const sigungus = sigunguResponse.data.response.body.items.item;

      // 각 시군구에 대해 장소 데이터를 가져와서 저장
      for (const sigungu of sigungus) {
        const sigunguCode = sigungu.code;
        const sigunguName = sigungu.name;

        console.log(`Fetching locations for ${sigunguName}...`);

        let pageNo = 1;
        let totalCount = 0;

        do {
          const response = await axios.get(
            "http://apis.data.go.kr/B551011/KorService1/areaBasedList1",
            {
              params: {
                serviceKey: serviceKey,
                areaCode: areaCode,
                sigunguCode: sigunguCode,
                numOfRows: 100, // 한 번에 가져올 최대 항목 수
                pageNo: pageNo,
                MobileOS: "ETC",
                MobileApp: "AppTest",
                _type: "json",
              },
            }
          );

          // 응답 데이터 구조 확인 및 처리
          if (
            response.data &&
            response.data.response &&
            response.data.response.body &&
            response.data.response.body.items
          ) {
            const items = response.data.response.body.items.item;
            totalCount = response.data.response.body.totalCount;

            // 각 항목을 MongoDB에 저장
            for (const item of items) {
              const locationData = {
                contentid: item.contentid,
                contenttype: contentTypeMap[item.contenttypeid] || "Unknown",
                title: item.title,
                addr1: item.addr1,
                addr2: item.addr2,
                zipcode: item.zipcode,
                tel: item.tel,
                firstimage: item.firstimage,
                mapx: parseFloat(item.mapx),
                mapy: parseFloat(item.mapy),
                mlevel: parseInt(item.mlevel, 10),
                areaname: "강원도",
                sigunguname: sigunguName, // 시군구 이름으로 저장
                category1: categoryMap[item.cat1] || item.cat1, // 존재하면 매핑, 없으면 원래 코드 사용
                category2: categoryMap[item.cat2] || item.cat2,
                category3: categoryMap[item.cat3] || item.cat3,
                createdtime: new Date(
                  item.createdtime.substring(0, 4) +
                    "-" +
                    item.createdtime.substring(4, 6) +
                    "-" +
                    item.createdtime.substring(6, 8)
                ),
                modifiedtime: new Date(
                  item.modifiedtime.substring(0, 4) +
                    "-" +
                    item.modifiedtime.substring(4, 6) +
                    "-" +
                    item.modifiedtime.substring(6, 8)
                ),
              };

              await collection.updateOne(
                { contentid: item.contentid },
                { $set: locationData },
                { upsert: true }
              );
            }

            console.log(`Page ${pageNo} for ${sigunguName} processed.`);
          } else {
            console.error(
              `Invalid response structure for ${sigunguName} on page ${pageNo}`
            );
            break;
          }

          pageNo++;
        } while ((pageNo - 1) * 100 < totalCount);
      }

      console.log("All data downloaded and stored.");
    } else {
      console.error("Invalid response structure for sigungu codes.");
    }
  } catch (error) {
    console.error("Error fetching or storing data:", error.message);
  } finally {
    await client.close();
  }
}

fetchAndStoreLocations();
