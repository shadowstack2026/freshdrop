import Badge from "./ui/badge";

const STATUS_VARIANTS = {
  MOTTAGEN: "primary",
  BOKAD: "primary",
  HÄMTAD: "neutral",
  TVÄTTAS: "warning",
  PÅ_VÄG: "primary",
  LEVERERAD: "success",
  AVBRUTEN: "danger"
};

export default function StatusBadge({ status }) {
  const variant = STATUS_VARIANTS[status] || "neutral";
  return <Badge variant={variant}>{status}</Badge>;
}

