import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    integer,
    decimal,
    jsonb,
    pgEnum,
    unique,
    serial,
    primaryKey,
    check
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ==========================================
// 1. ENUMS
// ==========================================
export const roleEnum = pgEnum('role', ['admin', 'owner', 'user']);
export const propertyTypeEnum = pgEnum('property_type', ['house', 'office', 'hall', 'apartment', 'studio', 'penthouse', 'villa', 'commercial']);
export const propertyStatusEnum = pgEnum('property_status', ['pending', 'active', 'inactive', 'expired']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'success', 'failed']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['pending', 'contacted', 'closed']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount']); // NEW
export const priceTypeEnum = pgEnum('price_type', ['hour', 'month', 'day', 'year', 'event', 'one-time']);


// ==========================================
// 2. USERS (The Wallet)
// ==========================================
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name'),
    name_bn: varchar('name_bn'),
    email: varchar('email').unique(),
    phoneNumber: varchar('phone_number').unique(),
    password: text('password'),
    role: roleEnum('role').default('user').notNull(),
    image: varchar('image'),

    // NEW: User's Wallet Balance
    pointsBalance: integer('points_balance').default(0).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp('deleted_at'),
});

// ==========================================
// 3. ZONES
// ==========================================
export const zones = pgTable('zones', {
    id: serial('id').primaryKey(),

    name: varchar('name').notNull(),
    name_bn: varchar('name_bn').notNull(),

    // Level 1: City / District (e.g., Dhaka, Chattogram)
    city: varchar('city'),
    city_bn: varchar('city_bn'),

    // Level 2: Thana / Upazila (e.g., Mirpur, Dhanmondi, Kotwali)
    thana: varchar('thana'),
    thana_bn: varchar('thana_bn'),

    // Level 3: Specific Area / Neighborhood (e.g., Mirpur 10, Bosila)
    area: varchar('area'),
    area_bn: varchar('area_bn'),

    isActive: boolean('is_active').default(true), // Admins can disable zones
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 4. PROPERTIES (The Core Engine)
// ==========================================
export const properties = pgTable('properties', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').references(() => ownerContacts.id, { onDelete: 'cascade' }).notNull(),
    zoneId: integer('zone_id').references(() => zones.id, { onDelete: 'restrict' }).notNull(),

    title: varchar('title').notNull(),
    title_bn: varchar('title_bn'),
    description: text('description'),
    description_bn: text('description_bn'),

    // NEW: Main cover image for fast UI loading
    coverImage: text('cover_image'),

    slug: varchar('slug').unique().notNull(),
    priceType: priceTypeEnum('price_type').default('month').notNull(),

    type: propertyTypeEnum('type').notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(),
    sizeSqft: integer('size_sqft'),
    roomCount: integer('room_count').notNull(),
    amenities: jsonb('amenities'),
    amenities_bn: jsonb('amenities_bn'),

    // Review Data
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00').notNull(),
    totalReviews: integer('total_reviews').default(0).notNull(),

    status: propertyStatusEnum('status').default('pending').notNull(),
    viewsCount: integer('views_count').default(0).notNull(),
    lastActivityDate: timestamp('last_activity_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp('deleted_at'),
});

// ==========================================
// 5. PRIVATE LOCATIONS (Paywall Security)
// ==========================================
export const propertyLocationsPrivate = pgTable('property_locations_private', {
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).primaryKey(),

    // Specific Identifier (e.g., "House 12", "Flat 4B", "Kazi Villa")
    house: varchar('house'),
    house_bn: varchar('house_bn'),

    // Routing (e.g., "Road 5", "Village Rahimpur")
    road: varchar('road'),
    road_bn: varchar('road_bn'),

    // Subdivision (e.g., "Block C", "Sector 10")
    block: varchar('block'),
    block_bn: varchar('block_bn'),

    // Cultural/Visual Identification (e.g., "Beside Boro Masjid")
    landmark: text('landmark'),
    landmark_bn: text('landmark_bn'),

    // Optional: Keep a full concatenated string just in case you need it for SMS/Email APIs easily
    additionalLine: text('additional_line'),
    additionalLine_bn: text('additional_line_bn'),
});

// ==========================================
// 6. ASSETS & CONTACTS
// ==========================================
export const propertyImages = pgTable('property_images', {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    imageUrl: text('image_url').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(), // Keep for gallery sorting
});

export const ownerContacts = pgTable('owner_contacts', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name').notNull(),
    name_bn: varchar('name_bn'),
    phone: text('phone').notNull(), // Encrypted
    whatsapp: text('whatsapp'),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// 7. STORE & PROMOS (New)
// ==========================================
export const pointPackages = pgTable('point_packages', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name').notNull(),          // e.g., "1000 Points"
    name_bn: varchar('name_bn'),
    points: integer('points').notNull(),      // e.g., 1000
    price: decimal('price', { precision: 10, scale: 2 }).notNull(), // e.g., 500.00
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promoCodes = pgTable('promo_codes', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code').notNull().unique(), // e.g., "WINTER20"
    discountType: discountTypeEnum('discount_type').notNull(),
    discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
    maxUses: integer('max_uses'),
    timesUsed: integer('times_used').default(0).notNull(),
    validUntil: timestamp('valid_until'),
    isActive: boolean('is_active').default(true).notNull(),
});

// ==========================================
// 8. TRANSACTIONS (Buying Points)
// ==========================================
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
    packageId: uuid('package_id').references(() => pointPackages.id, { onDelete: 'restrict' }).notNull(),
    promoCodeId: uuid('promo_code_id').references(() => promoCodes.id, { onDelete: 'set null' }),

    originalAmount: decimal('original_amount', { precision: 10, scale: 2 }).notNull(), // The base price of the package
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(), // The exact Taka discounted
    amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull(), // The final amount (Original - Discount)
    pointsCredited: integer('points_credited').notNull(), // Points added to wallet

    gateway: varchar('gateway'), // e.g., 'bKash'
    gatewayTrxId: varchar('gateway_trx_id').unique(),
    status: transactionStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// 9. UNLOCKS (Spending Points / 2-Month Access)
// ==========================================
export const unlocks = pgTable('unlocks', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),

    pointsSpent: integer('points_spent').notNull(), // e.g., 50 points
    unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(), // Calculated in code: unlockedAt + 2 months
}, (table) => ({
    // Ensures a user only has one active record per property. 
    // If they renew, you UPDATE the expiresAt rather than inserting a new row.
    unq: unique().on(table.userId, table.propertyId),
}));

// ==========================================
// 10. ENGAGEMENT & ALERTS
// ==========================================
export const savedProperties = pgTable('saved_properties', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    unq: unique().on(table.userId, table.propertyId),
}));

export const inquiries = pgTable('inquiries', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    message: text('message').notNull(),
    message_bn: text('message_bn'),
    status: inquiryStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const zoneSubscriptions = pgTable('zone_subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    zoneId: integer('zone_id').references(() => zones.id, { onDelete: 'cascade' }).notNull(),
    isEmailActive: boolean('is_email_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    unq: unique().on(table.userId, table.zoneId),
}));

// ==========================================
// 11. AUTHENTICATION (NextAuth.js)
// ==========================================
export const accounts = pgTable("accounts", {
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email" | "credentials">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
}, (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

//============================================
//      PROPERTY REVIEW
//============================================
export const reviews = pgTable('property_reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id')
        .references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' }).notNull(),

    rating: integer('rating').notNull(), // Star rating (1 to 5)
    message: text('message'),            // Optional review text

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
    // 🚨 1. The Magic Constraint: Ensures a user can only review a property ONCE
    unq: unique().on(table.propertyId, table.userId),

    // 🚨 2. Database-level validation: Ensures rating is strictly 1-5
    ratingCheck: check('rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`)
}));