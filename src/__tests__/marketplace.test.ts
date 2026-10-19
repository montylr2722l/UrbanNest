import { calculateCheckout, hasAvailableStock, COD_ORDER_STATE } from "@/lib/marketplace/checkout";

describe("marketplace checkout rules", () => {
  const line = (overrides: Partial<Parameters<typeof calculateCheckout>[0][number]> = {}) => ({
    variantId: "variant-1", storeId: "store-1", quantity: 2, unitPrice: "125.50", sellerId: "seller-1",
    productName: "Cotton shirt", sku: "SHIRT-M", size: "M", color: "Blue", imageUrl: null,
    commissionRate: "0.10", ...overrides,
  });

  it("calculates exact decimal totals and commission snapshots", () => {
    const result = calculateCheckout([line()]);
    expect(result.subtotal.toFixed(2)).toBe("251.00");
    expect(result.groups[0]?.commission.toFixed(2)).toBe("25.10");
    expect(result.groups[0]?.subtotal.toFixed(2)).toBe("251.00");
  });

  it("groups a mixed cart into seller and store suborders", () => {
    const result = calculateCheckout([line(), line({ variantId: "variant-2", sellerId: "seller-2", storeId: "store-2", quantity: 1, unitPrice: "80.00" })]);
    expect(result.groups).toHaveLength(2);
    expect(result.subtotal.toFixed(2)).toBe("331.00");
  });

  it("rejects empty and invalid quantity carts", () => {
    expect(() => calculateCheckout([])).toThrow("Cart is empty");
    expect(() => calculateCheckout([line({ quantity: 0 })])).toThrow("Invalid quantity");
  });

  it("counts reserved inventory against requested quantity", () => {
    expect(hasAvailableStock(5, 2, 3)).toBe(true);
    expect(hasAvailableStock(5, 2, 4)).toBe(false);
  });

  it("keeps COD orders confirmed but unpaid until collection", () => {
    expect(COD_ORDER_STATE.orderStatus).toBe("CONFIRMED");
    expect(COD_ORDER_STATE.paymentStatus).toBe("COD_PENDING");
  });
});
