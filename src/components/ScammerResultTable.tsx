import Pagination from "@/components/Pagination";

interface Scammer {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
}

interface ScammerResultTableProps {
  items: Scammer[];
  totalCount: number;
  loading: boolean;
  fetched: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

export default function ScammerResultTable({
  items,
  totalCount,
  loading,
  fetched,
  currentPage,
  onPageChange,
  pageSize,
}: ScammerResultTableProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {loading ? (
        <p className="py-16 text-center text-sm text-gray-400">검색 중...</p>
      ) : !fetched ? null : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            총{" "}
            <span className="font-semibold text-foreground">
              {totalCount.toLocaleString()}
            </span>
            건
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">이름</th>
                  <th className="px-5 py-3 text-left font-medium">전화번호</th>
                  <th className="px-5 py-3 text-left font-medium">계좌번호</th>
                  <th className="px-5 py-3 text-left font-medium">설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {item.name ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {item.phone_number ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {item.bank_account ?? "-"}
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-600">
                      {item.description ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
