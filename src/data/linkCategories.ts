import type { LinkCategory } from "@/data/type";

export const LINK_CATEGORIES: LinkCategory[] = [
  { id: 1,  code: "promotion", name: "텔레그램 홍보방 TOP 10",        sort_order: 0  },
  { id: 2,  code: "taxidermy", name: "텔레그램 박제방 TOP 10",        sort_order: 1  },
  { id: 3,  code: "scammer",   name: "텔레그램 사기꾼조회 TOP 10",    sort_order: 2  },
  { id: 4,  code: "toto",      name: "토토사이트 TOP 10",             sort_order: 3  },
  { id: 5,  code: "holdEm",    name: "텔레그램 홀덤 TOP 10",          sort_order: 4  },
  { id: 6,  code: "OTC",       name: "텔레그램 OTC 업자 TOP 10",      sort_order: 5  },
  { id: 7,  code: "agency",     name: "텔레그램 대리결제 업자 TOP 10", sort_order: 6  },
  { id: 8,  code: "USIM",      name: "텔레그램 유심 업자 TOP 10",     sort_order: 7  },
  { id: 9,  code: "010",       name: "텔레그램 010인증 업자 TOP 10",  sort_order: 8  },
  { id: 10, code: "design",    name: "텔레그램 디자인 업자 TOP 10",   sort_order: 9  },
  { id: 11, code: "DB",        name: "텔레그램 DB 업자 TOP 10",       sort_order: 10 },
  { id: 12, code: "etc",       name: "텔레그램 기타 업자 TOP 10",     sort_order: 11 },
];
