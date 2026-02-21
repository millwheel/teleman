# 프로필 수정 기능 도입

### image_path 컬럼 추가
- users 데이터에 image_path가 도입됨 (text)
- 해당 컬럼은 supabase storage에서 path를 가짐
- 다른 업로드와 마찬가지로 임시 저장소에 있다가, 저장버튼을 누르는 순간 비로소 storage에 업로드 실행

### 프로필 페이지 (/profile)
- image 등록, 수정, 삭제 가능
- username는 그냥 표시만 (아이디)
- nickname 수정 가능
- 저장 버튼 존재 (storage, db 저장 활성화)

### 헤더에 nickname 왼쪽에 프로필 사진 배치
- 해당 프로필 사진은 캐싱을 사용하여 매번 DB에서 호출하지 않도록 전략 구상 필요
- 프로필 사진을 눌렀을 때 /profile로 이동하여 프로필 수정할 수 있도록 처리