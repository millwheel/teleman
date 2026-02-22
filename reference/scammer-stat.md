## 등록 건수 섹션 처리

### UI
- 일렬로 좌측에서부터 '총 등록 업체수', '오늘 등록 건수', '오늘 검색 건수', '총 회원수' 카드를 보여줌
- 각 카드에서 위에는 숫자, 아래는 위 이름으로 보여줌
- UI 보여지는 방식은 reference/scammer-stat.png 참고하여 구현
- 하지만 reference/scammer-stat.png 보다 좀 더 세련된 디자인으로 보여주기
- 바탕색은 넣지 말것. 그림자 넣지 말것. ring 넣지 말 것

### 데이터 참조 조건
- 총 등록 업체수: scammer의 row를 count해서 보여줌
- 오늘 등록 건수: scammer.created_at이 오늘인 것을 count 해서 보여줌
- 오늘 검색 건수: scammer_search.count를 보여줌. stat_date가 오늘 날짜인 것을 보여줌
- 총 회원수: users를 count해서 보여줌