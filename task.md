# PostEditor 이미지 기능 개선 작업 분석

## 현재 상태

- TipTap v3.20.0 사용
- `@tiptap/extension-image`를 기본 옵션으로 사용 (커스텀 설정 없음)
- `TextAlign`은 `["heading", "paragraph"]`만 대상 → **이미지에는 정렬이 적용되지 않음**
- 이미지 선택/포커스 시 시각적 피드백 없음

## 요구사항

1. 이미지에도 정렬(왼쪽/가운데/오른쪽) 기능 적용
2. 이미지 선택 시 파란색 테두리로 표시

---

## 작업 목록

### 1. 커스텀 Image Extension 생성

**파일:** `src/extensions/ImageAlign.ts` (신규)

- `@tiptap/extension-image`를 확장(extend)하여 `textAlign` 속성 추가
- `addAttributes()`로 `textAlign` 어트리뷰트 정의 (기본값: `"left"`)
- `renderHTML()`에서 `style` 또는 `data-align` 속성으로 정렬 반영
  - `text-align`을 감싸는 `<div>` 혹은 `<figure>`로 출력하거나, `display: block; margin: 0 auto` 등 CSS로 처리
- 이미지를 inline이 아닌 block 노드로 설정하여 정렬이 동작하도록 함

### 2. TextAlign 설정 변경

**파일:** `src/components/post/PostEditor.tsx`

- `TextAlign.configure({ types: ["heading", "paragraph"] })` → `types`에 `"image"` 추가
- 또는 커스텀 Image Extension 내부에서 정렬을 자체 처리 (TextAlign 의존 없이)

### 3. 이미지 선택 시 파란색 테두리 CSS 추가

**파일:** `src/components/post/PostEditor.tsx`

- TipTap은 이미지 노드가 선택되면 `ProseMirror-selectednode` 클래스를 자동으로 부여함
- EditorContent의 className에 선택된 이미지 스타일 추가:
  ```
  [&_.tiptap_img.ProseMirror-selectednode]:outline-3
  [&_.tiptap_img.ProseMirror-selectednode]:outline-secondary
  [&_.tiptap_img.ProseMirror-selectednode]:outline
  [&_.tiptap_img.ProseMirror-selectednode]:rounded
  ```

### 4. PostViewer에서 정렬된 이미지 표시 지원

**파일:** `src/components/post/PostViewer.tsx`

- 커스텀 Image Extension이 출력하는 HTML 구조에 맞춰 정렬 CSS 추가
- 예: `data-align="center"` → `margin: 0 auto`, `data-align="right"` → `margin-left: auto`

### 5. PostEditor에서 Image Extension 교체

**파일:** `src/components/post/PostEditor.tsx`

- `import Image from "@tiptap/extension-image"` → 커스텀 확장으로 교체
- 정렬 버튼이 이미지 선택 시에도 동작하는지 확인

---

## 접근 방식 선택

### 방식 A: TextAlign에 image 타입 추가 (간단)

- `TextAlign.configure({ types: ["heading", "paragraph", "image"] })`
- 단, 기본 Image extension이 inline 노드이므로 `Image.configure({ inline: false })`로 block 처리 필요
- 가장 적은 코드 변경으로 구현 가능

### 방식 B: 커스텀 Image Extension (유연)

- `@tiptap/extension-image`를 extend하여 `textAlign` 어트리뷰트 직접 관리
- HTML 출력에 `data-align` 추가하여 PostViewer에서도 정렬 반영
- 더 세밀한 제어 가능하지만 코드량 증가

### 권장: 방식 A

- `Image.configure({ inline: false })`로 블록 노드 전환
- `TextAlign`의 `types`에 `"image"` 추가
- 선택 시 파란 테두리는 CSS만으로 해결
- PostViewer에서는 `style="text-align: center"` 등이 `<img>` 부모에 적용되므로 별도 처리 불필요
