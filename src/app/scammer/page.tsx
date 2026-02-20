export default function ScammerPage() {
  return <ComingSoon title="사기꾼조회" />;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        <p className="text-4xl font-bold text-[var(--secondary)] mb-2">{title}</p>
        <p className="text-gray-400 text-sm">준비 중입니다.</p>
      </div>
    </div>
  );
}
