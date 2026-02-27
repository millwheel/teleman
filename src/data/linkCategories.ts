import type { LinkCategory } from "@/data/type";

export const LINK_CATEGORIES: LinkCategory[] = [
  { code: "promotion", name: "텔레그램 홍보방",        sort_order: 0  },
  { code: "taxidermy", name: "텔레그램 박제방",        sort_order: 1  },
  { code: "scammer",   name: "텔레그램 사기꾼조회",    sort_order: 2  },
  { code: "toto",      name: "토토사이트",             sort_order: 3  },
  { code: "holdEm",    name: "텔레그램 홀덤",          sort_order: 4  },
  { code: "OTC",       name: "텔레그램 OTC 업자",      sort_order: 5  },
  { code: "agency",     name: "텔레그램 대리결제 업자", sort_order: 6  },
  { code: "USIM",      name: "텔레그램 유심 업자",     sort_order: 7  },
  { code: "010",       name: "텔레그램 010인증 업자",  sort_order: 8  },
  { code: "design",    name: "텔레그램 디자인 업자",   sort_order: 9  },
  { code: "DB",        name: "텔레그램 DB 업자",       sort_order: 10 },
  { code: "etc",       name: "텔레그램 기타 업자",     sort_order: 11 },
];
