/**
 * Påsstorlek: visningsnamn för UI (ingen kg i projektet).
 */
export const BAG_SIZE_LABELS = {
  small: "Liten påse",
  medium: "Vanlig påse",
  large: "Stor påse"
};

export function getBagSizeLabel(bagSize) {
  if (!bagSize) return "–";
  return BAG_SIZE_LABELS[bagSize] ?? bagSize;
}

/** Typ av tvätt: grovtvätt, vardagstvätt, mattvätt */
export const WASH_TYPE_LABELS = {
  grovtvatt: "Grovtvätt",
  vardagstvatt: "Vardagstvätt",
  mattvatt: "Mattvätt"
};

export function getWashTypeLabel(washType) {
  if (!washType) return "–";
  return WASH_TYPE_LABELS[washType] ?? washType;
}

/**
 * Formatera leverans som datum + tidsintervall (samma logik som upphämtning).
 * Om delivery_window finns: "YYYY-MM-DD 08:00-11:00", annars fallback till datum/tid från delivery_estimate_at.
 */
export function formatDeliveryDisplay(order) {
  const date = order.delivery_estimate_at
    ? new Date(order.delivery_estimate_at).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    : null;
  if (order.delivery_window) {
    return date ? `${date} ${order.delivery_window}` : order.delivery_window;
  }
  if (order.delivery_estimate_at) {
    return new Date(order.delivery_estimate_at).toLocaleString("sv-SE");
  }
  return "–";
}
