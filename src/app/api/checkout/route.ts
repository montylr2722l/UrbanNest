import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { z } from "zod";
import { PaymentMethod, PaymentProvider, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { calculateCheckout, hasAvailableStock, COD_ORDER_STATE, type CheckoutLine } from "@/lib/marketplace/checkout";

const schema = z.object({ addressId: z.string().min(1), paymentMethod: z.literal("COD") });

export async function POST(request: Request) {
  try {
    const user = await requireAuth([UserRole.CUSTOMER]);
    const form = await request.formData();
    const input = schema.parse(Object.fromEntries(form.entries()));
    const [address, cart, globalRule] = await Promise.all([
      prisma.address.findFirst({ where: { id: input.addressId, userId: user.id, deletedAt: null } }),
      prisma.cart.findUnique({ where: { userId: user.id }, include: { items: { include: { variant: true } } } }),
      prisma.commissionRule.findFirst({ where: { type: "GLOBAL", isActive: true, AND: [{ OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: new Date() } }] }, { OR: [{ effectiveTo: null }, { effectiveTo: { gt: new Date() } }] }] }, orderBy: { createdAt: "desc" }, select: { rate: true } }),
    ]);
    if (!address) return NextResponse.json({ error: "Choose one of your saved addresses." }, { status: 400 });
    if (!cart || cart.items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    const rate = globalRule?.rate ?? new Decimal("0.1000");
    const lines: CheckoutLine[] = [];
    for (const item of cart.items) {
      const variant = await prisma.productVariant.findFirst({ where: { id: item.variantId, isActive: true, product: { status: "PUBLISHED", seller: { isActive: true, isSuspended: false, user: { isActive: true, deletedAt: null } } }, inventory: { some: { storeId: item.storeId, store: { isActive: true } } } }, include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, inventory: { where: { storeId: item.storeId }, include: { store: { include: { seller: true } } } } } });
      const stock = variant?.inventory[0];
      if (!variant || !stock || stock.store.sellerId !== variant.product.sellerId || !hasAvailableStock(stock.quantity, stock.reservedQuantity, item.quantity)) return NextResponse.json({ error: "A cart item is no longer available in the requested quantity. Review your cart." }, { status: 409 });
      lines.push({ variantId: variant.id, storeId: item.storeId, quantity: item.quantity, unitPrice: variant.price, sellerId: stock.store.sellerId, productName: variant.product.name, sku: variant.sku, size: variant.size, color: variant.color, imageUrl: variant.product.images[0]?.url ?? null, commissionRate: rate });
    }
    const calculated = calculateCheckout(lines);
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const changed = await tx.$executeRaw`UPDATE "inventory" SET "quantity" = "quantity" - ${item.quantity}, "updatedAt" = NOW() WHERE "storeId" = ${item.storeId} AND "variantId" = ${item.variantId} AND "quantity" - "reservedQuantity" >= ${item.quantity}`;
        if (changed !== 1) throw new Error("STOCK_CHANGED");
      }
      const created = await tx.order.create({
        data: {
          customerId: user.id,
          status: COD_ORDER_STATE.orderStatus,
          paymentStatus: COD_ORDER_STATE.paymentStatus,
          paymentMethod: PaymentMethod.COD,
          shippingAddressSnapshot: {
            recipientName: address.recipientName, phone: address.phone, line1: address.line1,
            line2: address.line2, landmark: address.landmark, city: address.city,
            state: address.state, pincode: address.pincode, country: address.country,
          },
          subtotal: calculated.subtotal,
          totalAmount: calculated.subtotal,
          deliveryFee: new Decimal(0),
          discount: new Decimal(0),
          taxAmount: new Decimal(0),
          sellerOrders: {
            create: calculated.groups.map((group) => ({
              sellerId: group.sellerId,
              storeId: group.storeId,
              status: "PENDING",
              subtotal: group.subtotal,
              deliveryFee: new Decimal(0),
              commissionRate: rate,
              commissionAmount: group.commission,
              sellerAmount: group.subtotal.minus(group.commission),
              items: {
                create: group.lines.map((line) => ({
                  variantId: line.variantId,
                  productNameSnapshot: line.productName,
                  variantSnapshot: { size: line.size, color: line.color },
                  skuSnapshot: line.sku,
                  imageUrlSnapshot: line.imageUrl,
                  unitPrice: new Decimal(line.unitPrice),
                  quantity: line.quantity,
                  totalPrice: new Decimal(line.unitPrice).times(line.quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
                })),
              },
            })),
          },
          payment: {
            create: {
              amount: calculated.subtotal,
              method: PaymentMethod.COD,
              provider: PaymentProvider.COD,
              status: COD_ORDER_STATE.paymentStatus,
            },
          },
        },
        select: { id: true },
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    }, { isolationLevel: "Serializable" });
    return NextResponse.redirect(new URL(`/account/orders?placed=${order.id}`, request.url), 303);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.redirect(new URL("/login", request.url), 303);
    if (error instanceof Error && error.message === "STOCK_CHANGED") return NextResponse.json({ error: "Stock changed during checkout. Please try again." }, { status: 409 });
    return NextResponse.json({ error: "Unable to place the order. Please review the cart and try again." }, { status: 500 });
  }
}
