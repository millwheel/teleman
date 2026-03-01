import { FaTrophy } from "react-icons/fa6";
import { TbLaurelWreathFilled } from "react-icons/tb";

const TOP3 = [
  { Icon: FaTrophy, color: "#FFD700" },
  { Icon: FaTrophy, color: "#C0C0C0" },
  { Icon: FaTrophy, color: "#CD7F32" },
];
const REST = { Icon: TbLaurelWreathFilled, color: "#F97316" };

export default function RankBadge({ rank, size = 16 }: { rank: number; size?: number }) {
  const config = rank <= 3 ? TOP3[rank - 1] : REST;
  const { Icon, color } = config;
  return <Icon size={size} style={{ color, flexShrink: 0 }} />;
}
