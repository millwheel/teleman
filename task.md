# ImageBannerManager 리팩토링

## 목표
`src/components/admin/ImageBannerManager.tsx` 를 아래 3가지 요구사항에 맞게 리팩토링한다.

---

## Task 1: 헤더 항상 표시
- 현재: 배너가 없으면 `banners.length === 0` 조건으로 전체 목록 UI(헤더 포함)가 숨겨짐
- 변경: 이미지/이름/링크 컬럼 헤더는 loading, empty, data 상태 모두에서 항상 렌더링

---

## Task 2: 모달 컴포넌트 분리
- 현재: 추가/삭제 모달 JSX가 `ImageBannerManager` 내부에 인라인으로 작성되어 있음
- 변경: 별도 컴포넌트로 분리

| 컴포넌트 | 위치 | Props |
|---|---|---|
| `AddBannerModal` | 같은 파일 또는 별도 파일 | `apiPath`, `onClose`, `onSuccess` |
| `DeleteBannerModal` | 같은 파일 또는 별도 파일 | `banner`, `apiPath`, `onClose`, `onSuccess` |

- `onSuccess` 콜백에서 `router.refresh()` 호출
- `loading` state는 각 모달 컴포넌트가 자체적으로 관리

---

## Task 3: 렌더링 조건 삼항 연산자
- 현재: `banners.length === 0` 분기가 별도 JSX로 나뉘어 있고 loading 상태가 없음
- 변경: 삼항 연산자 중첩으로 3가지 상태 처리

```tsx
// 목록 영역 (헤더 아래)
{loading
  ? <로딩 중 표시>  // (1) loading
  : banners.length === 0
    ? <빈 상태 메시지>  // (2) 데이터 없음
    : banners.map(...)  // (3) 목록 렌더링
}
```

- `loading` state: `ImageBannerManager` 상위에서 관리하거나, 초기 fetch 없이 SSR props로 받으므로 기본값 `false`
- 빈 상태: 현재와 동일하게 "등록된 배너가 없습니다." 메시지

---

## 구현 순서
1. Task 2: `AddBannerModal`, `DeleteBannerModal` 컴포넌트 추출
2. Task 1 + 3: 헤더 항상 표시 + 삼항 연산자 구조 적용
3. 검증: 빌드 오류 없음, 기능 정상 동작 확인
