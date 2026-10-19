import Decimal from "decimal.js";

export type CheckoutLine = {
  variantId: string;
  storeId: string;
  quantity: number;
  unitPrice: Decimal.Value;
  sellerId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  commissionRate: Decimal.Value;
};

export function hasAvailableStock(quantity: number, reservedQuantity: number, requestedQuantity: number) {
  return Number.isInteger(requestedQuantity) && requestedQuantity > 0 && quantity - reservedQuantity >= requestedQuantity;
}

export const COD_ORDER_STATE = {
  orderStatus: "CONFIRMED" as const,
  paymentStatus: "COD_PENDING" as const,
  paymentProvider: "COD" as const,
};

export function calculateCheckout(lines: CheckoutLine[]) {
  if (lines.length === 0) throw new Error("Cart is empty");
  const groups = new Map<string, { sellerId: string; storeId: string; subtotal: Decimal; commission: Decimal; lines: CheckoutLine[] }>();
  let subtotal = new Decimal(0);
  for (const line of lines) {
    if (!hasAvailableStock(line.quantity, 0, line.quantity)) throw new Error("Invalid quantity");
    const lineTotal = new Decimal(line.unitPrice).times(line.quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    subtotal = subtotal.plus(lineTotal);
    const key = `${line.sellerId}:${line.storeId}`;
    const group = groups.get(key) ?? { sellerId: line.sellerId, storeId: line.storeId, subtotal: new Decimal(0), commission: new Decimal(0), lines: [] };
    group.subtotal = group.subtotal.plus(lineTotal);
    group.commission = group.commission.plus(lineTotal.times(line.commissionRate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
    group.lines.push(line);
    groups.set(key, group);
  }
  return { subtotal: subtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP), groups: [...groups.values()] };
}
