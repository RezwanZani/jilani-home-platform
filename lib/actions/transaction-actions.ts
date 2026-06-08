"use server";

import { db } from "@/lib/db";
import { transactions, users, pointPackages, promoCodes } from "@/lib/db/schema";
import { eq, desc, asc, or, ilike, and, gte, lte, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sendPaymentNotification } from "@/lib/emails/payment-notifications";

export async function fetchTransactions(page: number, limit: number = 10, search = "", sortKey = "createdAt", sortOrder = "desc", filters: any = null) {
    const offset = (page - 1) * limit;

    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            throw new Error("Unauthorized access");
        }

        const conditions = [];

        // Global Search
        if (search.trim() !== "") {
            const s = `%${search.trim()}%`;
            conditions.push(or(
                ilike(transactions.gatewayTrxId, s),
                ilike(transactions.invoiceNumber, s),
                ilike(pointPackages.name, s),
                ilike(users.name, s),
                ilike(users.email, s)
            ));
        }

        // Advanced Filters
        if (filters) {
            if (filters.userName) {
                conditions.push(ilike(users.name, `%${filters.userName}%`));
            }
            if (filters.gateway && filters.gateway !== "all") {
                conditions.push(eq(transactions.gateway, filters.gateway));
            }
            if (filters.status && filters.status !== "all") {
                conditions.push(eq(transactions.status, filters.status));
            }
            if (filters.packageName) {
                conditions.push(ilike(pointPackages.name, `%${filters.packageName}%`));
            }
            if (filters.promoCode) {
                conditions.push(ilike(promoCodes.code, `%${filters.promoCode}%`));
            }
            if (filters.minAmount) {
                conditions.push(gte(transactions.amountPaid, filters.minAmount));
            }
            if (filters.maxAmount) {
                conditions.push(lte(transactions.amountPaid, filters.maxAmount));
            }
            if (filters.dateFrom) {
                conditions.push(gte(transactions.createdAt, new Date(filters.dateFrom)));
            }
            if (filters.dateUntil) {
                const checkDate = new Date(filters.dateUntil);
                checkDate.setHours(23, 59, 59, 999);
                conditions.push(lte(transactions.createdAt, checkDate));
            }
        }

        const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;

        let orderByColumn: any;
        if (sortKey === 'gatewayTrxId') orderByColumn = transactions.gatewayTrxId;
        else if (sortKey === 'status') orderByColumn = transactions.status;
        else if (sortKey === 'amountPaid') orderByColumn = transactions.amountPaid;
        else if (sortKey === 'pointsCredited') orderByColumn = transactions.pointsCredited;
        else orderByColumn = transactions.createdAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        const data = await db
            .select({
                id: transactions.id,
                originalAmount: transactions.originalAmount,
                discountAmount: transactions.discountAmount,
                amountPaid: transactions.amountPaid,
                pointsCredited: transactions.pointsCredited,
                gateway: transactions.gateway,
                gatewayTrxId: transactions.gatewayTrxId,
                status: transactions.status,
                createdAt: transactions.createdAt,
                invoiceNumber: transactions.invoiceNumber,
                senderNumber: transactions.senderNumber,
                paymentScreenshot: transactions.paymentScreenshot,
                remark: transactions.remark,

                userName: users.name,
                userEmail: users.email,
                userPhone: users.phoneNumber,

                packageName: pointPackages.name,

                promoCode: promoCodes.code,
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .leftJoin(pointPackages, eq(transactions.packageId, pointPackages.id))
            .leftJoin(promoCodes, eq(transactions.promoCodeId, promoCodes.id))
            .where(finalCondition)
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        const hasMore = data.length > limit;
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error in fetchTransactions:", error);
        throw new Error("Failed to fetch data");
    }
}

export async function submitCheckout(data: {
    packageId: string;
    promoCodeId?: string;
    gateway: string;
    gatewayTrxId: string;
    senderNumber: string;
    paymentScreenshot?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized access" };
        }

        const userId = session.user.id;

        // Verify package
        const pkg = await db.query.pointPackages.findFirst({
            where: eq(pointPackages.id, data.packageId)
        });

        if (!pkg || !pkg.isActive) {
            return { success: false, error: "Invalid or inactive package." };
        }

        // Check if trx id is already used and approved
        const existingTrx = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.gatewayTrxId, data.gatewayTrxId),
                eq(transactions.status, 'success')
            )
        });
        if (existingTrx) {
            return { success: false, error: "This Transaction ID has already been successfully used." };
        }

        let discountAmount = 0;
        let originalAmount = Number(pkg.price);
        let amountPaid = originalAmount;
        let finalPromoId = null;

        // Verify promo code if provided
        if (data.promoCodeId) {
            const promo = await db.query.promoCodes.findFirst({
                where: eq(promoCodes.id, data.promoCodeId)
            });

            if (promo && promo.isActive) {
                // Do the same validation as in validatePromoCode
                let isValid = true;
                if (promo.validUntil && promo.validUntil < new Date()) isValid = false;
                if (promo.maxUses !== null && promo.timesUsed >= promo.maxUses) isValid = false;

                if (isValid) {
                    let isUserLimitReached = false;
                    if (promo.maxUsesPerUser !== null) {
                        const userTransactions = await db.select().from(transactions).where(
                            and(
                                eq(transactions.userId, userId),
                                eq(transactions.promoCodeId, promo.id),
                                or(
                                    eq(transactions.status, 'success'),
                                    eq(transactions.status, 'pending')
                                )
                            )
                        );
                        if (userTransactions.length >= promo.maxUsesPerUser) {
                            isUserLimitReached = true;
                        }
                    }

                    if (!isUserLimitReached) {
                        if (promo.discountType === 'percentage') {
                            discountAmount = (originalAmount * Number(promo.discountValue)) / 100;
                        } else {
                            discountAmount = Number(promo.discountValue);
                        }

                        if (discountAmount > originalAmount) {
                            discountAmount = originalAmount;
                        }

                        amountPaid = originalAmount - discountAmount;
                        finalPromoId = promo.id;
                    } else {
                        return { success: false, error: "You have reached the maximum usage limit for this promo code." };
                    }
                } else {
                    return { success: false, error: "Promo code is invalid or expired." };
                }
            } else {
                return { success: false, error: "Promo code is inactive or invalid." };
            }
        }

        // Generate Invoice Number (YYMM + Serial)
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `${year}${month}`;

        const existingThisMonth = await db.query.transactions.findMany({
            where: ilike(transactions.invoiceNumber, `${prefix}%`),
            columns: { id: true }
        });

        const serialStr = (existingThisMonth.length + 1).toString().padStart(4, '0');
        const invoiceNumber = `${prefix}${serialStr}`;

        // Create transaction
        await db.insert(transactions).values({
            userId,
            packageId: pkg.id,
            promoCodeId: finalPromoId,
            originalAmount: String(originalAmount),
            discountAmount: String(discountAmount),
            amountPaid: String(amountPaid),
            pointsCredited: pkg.points,
            gateway: data.gateway,
            gatewayTrxId: data.gatewayTrxId,
            status: "pending",

            invoiceNumber,
            senderNumber: data.senderNumber,
            paymentScreenshot: data.paymentScreenshot || null,
        });

        // If promo code was used, we probably should increment timesUsed in the promo table when transaction is successful.
        // Or we increment it now? It's pending, let's increment it on success to be safe, but then concurrent users can bypass.
        // Let's stick to checking usage dynamically or incrementing on approval.

        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        await sendPaymentNotification("pending", {
            userName: user?.name || 'User',
            userEmail: user?.email || '',
            userPhone: user?.phoneNumber || data.senderNumber || '',
            amount: amountPaid,
            points: pkg.points,
            trxId: data.gatewayTrxId,
            invoiceId: invoiceNumber,
            gateway: data.gateway,
        });

        return { success: true, invoiceNumber };

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return { success: false, error: error.message || "Checkout failed." };
    }
}

export async function updateTransactionStatus(id: string, status: "success" | "failed", remark?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access" };
        }

        // Get transaction
        const trx = await db.query.transactions.findFirst({
            where: eq(transactions.id, id)
        });

        if (!trx) {
            return { success: false, error: "Transaction not found." };
        }

        if (trx.status === status) {
            return { success: false, error: `Transaction is already marked as ${status}.` };
        }



        if (status === "success" && trx.gatewayTrxId) {
            const existingTrx = await db.query.transactions.findFirst({
                where: and(
                    eq(transactions.gatewayTrxId, trx.gatewayTrxId),
                    eq(transactions.status, 'success')
                )
            });
            if (existingTrx) {
                return { success: false, error: "Another transaction with this Transaction ID is already approved." };
            }
        }

        // Update status
        await db.update(transactions)
            .set({ status, remark: remark || null })
            .where(eq(transactions.id, id));

        const user = await db.query.users.findFirst({
            where: eq(users.id, trx.userId)
        });

        if (status === "success" && (trx.status === "pending" || trx.status === "failed")) {
            // Credit points to user
            if (user) {
                await db.update(users)
                    .set({ pointsBalance: (user.pointsBalance || 0) + (trx.pointsCredited || 0) })
                    .where(eq(users.id, trx.userId));
            }

            // Increment promo code usage if applicable
            if (trx.promoCodeId) {
                const promo = await db.query.promoCodes.findFirst({
                    where: eq(promoCodes.id, trx.promoCodeId)
                });

                if (promo) {
                    await db.update(promoCodes)
                        .set({ timesUsed: (promo.timesUsed || 0) + 1 })
                        .where(eq(promoCodes.id, trx.promoCodeId));
                }
            }
        } else if (status === "failed" && trx.status === "success") {
            // Deduct points from user
            if (user) {
                await db.update(users)
                    .set({ pointsBalance: (user.pointsBalance || 0) - (trx.pointsCredited || 0) })
                    .where(eq(users.id, trx.userId));
            }

            // Decrement promo code usage if applicable
            if (trx.promoCodeId) {
                const promo = await db.query.promoCodes.findFirst({
                    where: eq(promoCodes.id, trx.promoCodeId)
                });

                if (promo && (promo.timesUsed || 0) > 0) {
                    await db.update(promoCodes)
                        .set({ timesUsed: (promo.timesUsed || 0) - 1 })
                        .where(eq(promoCodes.id, trx.promoCodeId));
                }
            }
        }

        const pkg = trx.packageId ? await db.query.pointPackages.findFirst({ where: eq(pointPackages.id, trx.packageId) }) : null;
        const promo = trx.promoCodeId ? await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, trx.promoCodeId) }) : null;
        
        const transactionData = {
            ...trx,
            status,
            userName: user?.name,
            userEmail: user?.email,
            packageName: pkg?.name,
            promoCode: promo?.code,
            amountPaid: String(trx.amountPaid),
            originalAmount: String(trx.originalAmount),
            discountAmount: String(trx.discountAmount),
        };

        await sendPaymentNotification(status, {
            userName: user?.name || 'User',
            userEmail: user?.email || '',
            userPhone: user?.phoneNumber || trx.senderNumber || '',
            amount: Number(trx.amountPaid),
            points: trx.pointsCredited || 0,
            trxId: trx.gatewayTrxId || trx.id,
            invoiceId: trx.invoiceNumber || '',
            gateway: trx.gateway || 'Unknown',
            reason: remark || trx.remark || undefined,
        }, transactionData);

        const { revalidatePath } = require("next/cache");
        revalidatePath("/admin/transactions");

        return { success: true };
    } catch (error: any) {
        console.error("Update Transaction Error:", error);
        return { success: false, error: "Failed to update transaction." };
    }
}

export async function adminCreateTransaction(data: {
    userId: string;
    packageId: string;
    promoCodeId?: string;
    gateway: string;
    gatewayTrxId: string;
    senderNumber: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access" };
        }

        const pkg = await db.query.pointPackages.findFirst({
            where: eq(pointPackages.id, data.packageId)
        });

        if (!pkg) return { success: false, error: "Package not found." };

        const user = await db.query.users.findFirst({
            where: eq(users.id, data.userId)
        });

        if (!user) return { success: false, error: "User not found." };

        let discountAmount = 0;
        let originalAmount = Number(pkg.price);

        if (data.promoCodeId) {
            const promo = await db.query.promoCodes.findFirst({
                where: eq(promoCodes.id, data.promoCodeId)
            });
            if (promo) {
                if (promo.discountType === 'percentage') {
                    discountAmount = (originalAmount * Number(promo.discountValue)) / 100;
                } else {
                    discountAmount = Number(promo.discountValue);
                }

                await db.update(promoCodes)
                    .set({ timesUsed: (promo.timesUsed || 0) + 1 })
                    .where(eq(promoCodes.id, promo.id));
            }
        }

        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `${year}${month}`;

        const existingThisMonth = await db.query.transactions.findMany({
            where: ilike(transactions.invoiceNumber, `${prefix}%`),
            columns: { id: true }
        });

        const serialStr = (existingThisMonth.length + 1).toString().padStart(4, '0');
        const invoiceNumber = `${prefix}${serialStr}`;

        await db.insert(transactions).values({
            userId: data.userId,
            packageId: data.packageId,
            promoCodeId: data.promoCodeId || null,
            originalAmount: String(originalAmount),
            discountAmount: String(discountAmount),
            amountPaid: String(Math.max(0, originalAmount - discountAmount)),
            pointsCredited: pkg.points,
            gateway: data.gateway,
            gatewayTrxId: data.gatewayTrxId,
            status: "success",
            invoiceNumber,
            senderNumber: data.senderNumber,
            paymentScreenshot: null,
        });

        await db.update(users)
            .set({ pointsBalance: (user.pointsBalance || 0) + pkg.points })
            .where(eq(users.id, data.userId));

        const transactionData = {
            createdAt: date,
            status: "success",
            userName: user.name,
            userEmail: user.email,
            invoiceNumber,
            gatewayTrxId: data.gatewayTrxId,
            gateway: data.gateway,
            packageName: pkg.name,
            pointsCredited: pkg.points,
            originalAmount: String(originalAmount),
            discountAmount: String(discountAmount),
            promoCode: data.promoCodeId ? (await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, data.promoCodeId) }))?.code : undefined,
            amountPaid: String(Math.max(0, originalAmount - discountAmount)),
        };

        await sendPaymentNotification("success", {
            userName: user.name || 'User',
            userEmail: user.email || '',
            userPhone: user.phoneNumber || data.senderNumber || '',
            amount: Number(transactionData.amountPaid),
            points: pkg.points,
            trxId: data.gatewayTrxId,
            invoiceId: invoiceNumber,
            gateway: data.gateway,
        }, transactionData);

        const { revalidatePath } = require("next/cache");
        revalidatePath("/admin/transactions");

        return { success: true };
    } catch (error: any) {
        console.error("Admin Create Transaction Error:", error);
        return { success: false, error: "Failed to create transaction manually." };
    }
}

export async function searchUsersForManualAdd(query: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "admin") {
            return { success: false, error: "Unauthorized access" };
        }

        const searchTerm = `%${query}%`;
        const result = await db.query.users.findMany({
            where: or(
                ilike(users.email, searchTerm),
                ilike(users.name, searchTerm),
                ilike(users.phoneNumber, searchTerm)
            ),
            limit: 5
        });

        if (!result || result.length === 0) {
            return { success: false, error: "User not found" };
        }

        return {
            success: true,
            users: result.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phoneNumber }))
        };
    } catch (error) {
        return { success: false, error: "Error searching user" };
    }
}

export async function fetchUserTransactions(page: number, limit: number = 10, search = "", sortKey = "createdAt", sortOrder = "desc") {
    const offset = (page - 1) * limit;

    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized access");
        }
        const userId = session.user.id;

        const conditions = [eq(transactions.userId, userId)];

        if (search.trim() !== "") {
            const s = `%${search.trim()}%`;
            const searchCondition = or(
                ilike(transactions.gatewayTrxId, s),
                ilike(transactions.invoiceNumber, s),
                ilike(pointPackages.name, s)
            );
            if (searchCondition) {
                conditions.push(searchCondition);
            }
        }

        const finalCondition = and(...conditions);

        let orderByColumn: any;
        if (sortKey === 'gatewayTrxId') orderByColumn = transactions.gatewayTrxId;
        else if (sortKey === 'status') orderByColumn = transactions.status;
        else if (sortKey === 'amountPaid') orderByColumn = transactions.amountPaid;
        else if (sortKey === 'pointsCredited') orderByColumn = transactions.pointsCredited;
        else orderByColumn = transactions.createdAt;

        const order: any = sortOrder === "desc" ? desc(orderByColumn) : asc(orderByColumn);

        const data = await db
            .select({
                id: transactions.id,
                originalAmount: transactions.originalAmount,
                discountAmount: transactions.discountAmount,
                amountPaid: transactions.amountPaid,
                pointsCredited: transactions.pointsCredited,
                gateway: transactions.gateway,
                gatewayTrxId: transactions.gatewayTrxId,
                status: transactions.status,
                createdAt: transactions.createdAt,
                invoiceNumber: transactions.invoiceNumber,
                senderNumber: transactions.senderNumber,
                paymentScreenshot: transactions.paymentScreenshot,
                remark: transactions.remark,

                userName: users.name,
                userEmail: users.email,
                userPhone: users.phoneNumber,

                packageName: pointPackages.name,

                promoCode: promoCodes.code,
            })
            .from(transactions)
            .leftJoin(users, eq(transactions.userId, users.id))
            .leftJoin(pointPackages, eq(transactions.packageId, pointPackages.id))
            .leftJoin(promoCodes, eq(transactions.promoCodeId, promoCodes.id))
            .where(finalCondition)
            .limit(limit + 1)
            .orderBy(order)
            .offset(offset);

        const hasMore = data.length > limit;
        const dataToReturn = hasMore ? data.slice(0, -1) : data;

        return { data: dataToReturn, hasMore };
    } catch (error) {
        console.error("Database error in fetchUserTransactions:", error);
        throw new Error("Failed to fetch data");
    }
}
