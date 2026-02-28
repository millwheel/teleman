# `.then()` → `async/await` 전환 판별

## 대상 파일 목록

### 1. `src/components/AdBannerSection.tsx:11-15`

```ts
useEffect(() => {
  fetch("/api/ads")
    .then((res) => res.json())
    .then((data: AdBanner[]) => setBanners(shuffle(data)));
}, []);
```

**전환 가능 여부: O**
단순 fetch → json → setState. async 함수로 래핑하면 더 읽기 쉬움.

---

### 2. `src/app/(main)/guarantee/page.tsx:12-17`

```ts
useEffect(() => {
  fetch("/api/banners/guarantee")
    .then((res) => res.json())
    .then((data: GuaranteeBanner[]) => setBanners(shuffle(data)))
    .finally(() => setLoading(false));
}, []);
```

**전환 가능 여부: O**
`.finally()`는 try/finally로 대체.

---

### 3. `src/app/(main)/scammer/page.tsx:18-26`

```ts
useEffect(() => {
  Promise.all([
    fetch("/api/me").then((r) => r.json()),
    fetch("/api/scammer/stats").then((r) => r.json()),
  ]).then(([meData, statsData]) => {
    setIsLoggedIn(!!meData.user);
    setStats(statsData);
  });
}, []);
```

**전환 가능 여부: O**
Promise.all + .then 체이닝. await로 변환하면 구조가 명확해짐.

---

### 4. `src/app/admin/ad/page.tsx:111-116`

```ts
useEffect(() => {
  void fetch(API_PATH)
    .then((res) => res.json())
    .then((data) => setBanners(Array.isArray(data) ? data : []))
    .finally(() => setLoading(false));
}, []);
```

**전환 가능 여부: O**
`void`로 시작하는 것 자체가 async 래핑이 더 자연스러운 케이스.

---

### 5. `src/app/admin/guarantee/page.tsx:26-31`

```ts
useEffect(() => {
  void fetch(API_PATH)
    .then((res) => res.json())
    .then((data) => setBanners(Array.isArray(data) ? data : []))
    .finally(() => setLoading(false));
}, []);
```

**전환 가능 여부: O**
4번과 동일 패턴.

---

### 6. `src/app/admin/link/[categoryCode]/page.tsx:35-39`

```ts
useEffect(() => {
  fetch(`/api/admin/links?categoryCode=${categoryCode}`)
    .then((r) => r.json())
    .then((d) => setBanners(Array.isArray(d) ? d : []));
}, [categoryCode]);
```

**전환 가능 여부: O**
단순 fetch → setState.

---

### 7. `src/app/admin/link/[categoryCode]/page.tsx:41-46` (refetch 함수)

```ts
function refetch() {
  fetch(`/api/admin/links?categoryCode=${categoryCode}`)
    .then((r) => r.json())
    .then((d) => setBanners(Array.isArray(d) ? d : []));
  router.refresh();
}
```

**전환 가능 여부: O**
async function으로 변경하고 `router.refresh()`를 await 이후에 호출하면 순서도 보장됨. 현재는 fetch 완료 전에 `router.refresh()`가 실행되는 잠재적 문제가 있음.

---

### 8. `src/app/(main)/scammer/result/page.tsx:26-37` (fetchSearch 캐시 함수)

```ts
function fetchSearch(type: string, q: string, page: number): Promise<SearchResult | null> {
  const key = `${type}:${q}:${page}`;
  if (!searchCache.has(key)) {
    searchCache.set(
      key,
      fetch(`/api/scammer/search?type=${type}&q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    );
  }
  return searchCache.get(key)!;
}
```

**전환 가능 여부: X — 변경하지 않는 것이 좋음**
이 함수는 Promise를 캐시 Map에 저장하고 `use()` 훅으로 소비하는 패턴.
async로 변환해도 동작은 동일하지만, Promise 객체를 명시적으로 캐시에 저장하는 의도가 `.then()` 체이닝으로 더 명확하게 드러남.
`use()` 훅이 Promise를 직접 받아야 하므로 현재 패턴이 적합.

---

### 9. `src/app/(main)/scammer/result/page.tsx:70-73` (SearchBarWithAuth)

```ts
useEffect(() => {
  fetch("/api/auth/me")
    .then((r) => setIsLoggedIn(r.ok))
    .catch(() => setIsLoggedIn(false));
}, []);
```

**전환 가능 여부: O**
단순 fetch → setState. try/catch로 대체.

---

## 요약

| # | 파일 | 전환 | 사유 |
|---|------|------|------|
| 1 | AdBannerSection.tsx | O | 단순 fetch → setState |
| 2 | (main)/guarantee/page.tsx | O | 단순 fetch + finally |
| 3 | (main)/scammer/page.tsx | O | Promise.all + then 체이닝 |
| 4 | admin/ad/page.tsx | O | void + then 체이닝 |
| 5 | admin/guarantee/page.tsx | O | 4번과 동일 |
| 6 | admin/link/[categoryCode] useEffect | O | 단순 fetch → setState |
| 7 | admin/link/[categoryCode] refetch | O | async 전환 시 순서 보장 개선 |
| 8 | scammer/result fetchSearch | **X** | Promise 캐시 + use() 훅 패턴, 현행 유지 |
| 9 | scammer/result SearchBarWithAuth | O | 단순 fetch → setState |

**8번을 제외한 전부 전환 가능.**
