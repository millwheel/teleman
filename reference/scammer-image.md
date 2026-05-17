# 사기꾼 이미지 첨부 기능 기획

## 개요
- 사기꾼 정보에 **선택적으로 이미지 1장**을 첨부할 수 있도록 한다.
- 이미지는 증거 자료 성격이며, 없는 사기꾼이 다수일 것이므로 nullable로 다룬다.
- Supabase Storage 버킷 `public-media`의 `scammers/` 폴더에 저장한다.

---

## 1. 데이터 모델

### 1-1. `scammer` 테이블 컬럼 추가
```sql
ALTER TABLE public.scammer
  ADD COLUMN image_path TEXT NULL,   -- Storage 객체 경로 (예: scammers/uuid.png)
  ADD COLUMN public_url TEXT NULL;   -- 캐시된 public URL
```
- 두 컬럼 모두 nullable.
- 기존 `link` 테이블과 동일한 패턴(`image_path` + `public_url` 페어)을 따라 일관성 유지.

### 1-2. 공용 타입 추가 — `src/data/type.ts`
```ts
export type Scammer = {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
  image_path: string | null;
  public_url: string | null;
  created_at: string;
};
```
- 현재 `src/app/admin/scammer/page.tsx`와 `src/app/(main)/scammer/result/page.tsx`에 중복 선언된 local `interface Scammer`를 제거하고 위 타입으로 통합한다.

---

## 2. Storage

| 항목 | 값 |
|------|-----|
| 버킷 | `public-media` |
| 폴더 | `scammers/` |
| 파일명 | `scammers/{uuid}.{ext}` |
| 첨부 개수 | 1장 (다중 업로드 미지원) |
| 허용 타입 | `image/*` (jpg, png, webp 등) |
| 용량 제한 | 기존 배너 업로드와 동일한 상수 재사용 |

`src/lib/storage.ts`의 `uploadImage` / `getPublicImageUrl` / `deleteImage`를 그대로 사용한다. Storage 호출은 **API route 내부에서만** 수행한다.

---

## 3. API 변경

### 3-1. `POST /api/admin/scammer`
- 요청 형식을 JSON → `multipart/form-data`로 전환.
- 텍스트 필드(`name`, `phone_number`, `bank_account`, `description`)는 그대로, 추가로 `image` (File, 선택) 수신.
- 파일 있으면:
  1. `uploadImage("scammers/{uuid}.{ext}", buffer, contentType)`
  2. `getPublicImageUrl(path)`로 url 계산
  3. insert 시 `image_path`, `public_url` 함께 저장
- Storage 업로드 실패 시 DB insert 중단(rollback).

### 3-2. `PATCH /api/admin/scammer/[id]`
세 가지 케이스 처리:

| 케이스 | 동작 |
|--------|------|
| 이미지 유지 | 컬럼 변경 없음 |
| 새 이미지 업로드 (기존 없음 → 추가, 기존 있음 → 교체) | 기존 `image_path` 있으면 `deleteImage`, 새 파일 업로드 후 두 컬럼 update |
| 이미지 제거 | `deleteImage(기존 image_path)` 후 두 컬럼 `NULL`로 update |

요청 파라미터:
- `image` (File, 선택) — 새 파일
- `removeImage` (string `"true"`, 선택) — 제거 플래그

### 3-3. `DELETE /api/admin/scammer/[id]`
- 행 삭제 전 `image_path` 조회 → 있으면 `deleteImage()` 호출 후 row delete.

### 3-4. `GET /api/scammer/search`
- select 컬럼에 `image_path, public_url` 추가.
- 응답 타입은 `Scammer` 타입 기준으로 정렬.

### 3-5. `GET /api/admin/scammer`
- select 컬럼에 `image_path, public_url` 추가 (관리자 목록에서 노출 여부와 무관하게 수정 모달에서 필요).

---

## 4. UI 변경

### 4-1. 사용자 상세 모달 — `src/app/(main)/scammer/result/page.tsx`
**이미지는 "이름"보다 위에 배치한다.**

레이아웃 순서:
1. **이미지** (`public_url` 있을 때만, 없으면 영역 자체를 렌더링하지 않음)
2. 이름
3. 전화번호
4. 계좌번호
5. 설명

```tsx
{selected && (
  <Modal title="사기꾼 상세 정보" onClose={() => setSelected(null)}>
    <div className="space-y-4 text-sm">
      {selected.public_url && (
        <div>
          <Image
            src={selected.public_url}
            alt="증거 이미지"
            width={800}
            height={600}
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      )}
      <dl className="space-y-4">
        <div>
          <dt className="mb-1 font-medium text-gray-500">이름</dt>
          <dd className="text-foreground">{selected.name ?? "-"}</dd>
        </div>
        {/* 전화번호, 계좌번호, 설명 … */}
      </dl>
    </div>
  </Modal>
)}
```

### 4-2. 관리자 등록/수정 모달 — `src/app/admin/scammer/page.tsx`
**이미지 입력은 "설명"보다 아래에 배치한다.**

폼 필드 순서:
1. 이름
2. 전화번호
3. 계좌번호
4. 설명
5. **이미지 (선택)** ← 신규

이미지 영역 구성:
- 현재 이미지 미리보기 (있는 경우)
- 파일 선택 input (`accept="image/*"`)
- 새 파일 선택 시 미리보기 갱신
- "이미지 제거" 버튼 (기존 이미지 있을 때만 노출)

`FormState` 확장:
```ts
interface FormState {
  name: string;
  phone_number: string;
  bank_account: string;
  description: string;
  imageFile: File | null;     // 새로 선택한 파일
  removeImage: boolean;       // 기존 이미지 제거 여부
}
```

submit 시 `FormData`로 전환:
```ts
const fd = new FormData();
fd.append("name", form.name);
fd.append("phone_number", form.phone_number);
fd.append("bank_account", form.bank_account);
fd.append("description", form.description);
if (form.imageFile) fd.append("image", form.imageFile);
if (form.removeImage) fd.append("removeImage", "true");

await fetch(url, { method, body: fd });
```

### 4-3. 관리자 목록 표
- 이미지 컬럼은 추가하지 않는다(공간 절약). 수정 모달에서 미리보기로 확인 가능.

---

## 5. 엣지 케이스

| 상황 | 처리 |
|------|------|
| 수정 시 이미지만 새로 올림 | 기존 파일 `deleteImage`, 새 파일 upload, 컬럼 둘 다 update |
| 수정 시 이미지 제거 | `deleteImage` 후 두 컬럼 `NULL` |
| 사기꾼 행 삭제 | row delete 전 storage 정리 |
| Storage 업로드 실패 | 행 insert/update 중단, 에러 응답 |
| 잘못된 mime/용량 | route에서 거부 (`image/*` 화이트리스트 + 용량 상수) |
| 기존 이미지 교체 중 새 파일 업로드 성공·DB update 실패 | 새로 올린 파일 `deleteImage`로 정리 (best effort) |

---

## 6. 작업 순서

1. DB 마이그레이션 — `scammer` 테이블에 `image_path`, `public_url` 컬럼 추가
2. `src/data/type.ts`에 `Scammer` 공용 타입 추가
3. 두 페이지의 local `interface Scammer` 제거 후 공용 타입으로 교체
4. `POST /api/admin/scammer` — `multipart/form-data` + storage 연동
5. `PATCH /api/admin/scammer/[id]` — 추가/교체/제거 3케이스 처리
6. `DELETE /api/admin/scammer/[id]` — storage 정리 추가
7. `GET /api/scammer/search`, `GET /api/admin/scammer` — select 컬럼 확장
8. 관리자 모달에 이미지 입력 UI 추가 (설명 아래)
9. 사용자 상세 모달에 이미지 렌더링 추가 (이름 위)
