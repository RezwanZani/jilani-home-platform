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
    primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. ENUMS
// ==========================================
export const roleEnum = pgEnum('role', ['admin', 'owner', 'user']);
export const propertyTypeEnum = pgEnum('property_type', ['house', 'office', 'hall']);
export const propertyStatusEnum = pgEnum('property_status', ['pending', 'active', 'inactive', 'expired']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'success', 'failed']);
export const inquiryStatusEnum = pgEnum('inquiry_status', ['pending', 'contacted', 'closed']);

// ==========================================
// 2. USERS (Integrated with Auth.js Logic)
// ==========================================
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name'),
    name_bn: varchar('name_bn'), // Optional
    email: varchar('email').unique(),
    phoneNumber: varchar('phone_number').unique(), // Primary for anti-scam OTP
    password: text('password'), // Hashed
    role: roleEnum('role').default('user').notNull(),

    //Track the exact moment their 2-month access expires
    subscriptionEndsAt: timestamp('subscription_ends_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp('deleted_at'), // Soft delete
});

// ==========================================
// 3. ZONES
// ==========================================
export const zones = pgTable('zones', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(), // e.g., "Dhanmondi"
    name_bn: varchar('name_bn'),     // e.g., "ধানমন্ডি"
    city: varchar('city').notNull(), // e.g., "Dhaka"
    city_bn: varchar('city_bn'),     // e.g., "ঢাকা"
});

// ==========================================
// 4. PROPERTIES (The Core Engine)
// ==========================================
export const properties = pgTable('properties', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    zoneId: integer('zone_id').references(() => zones.id, { onDelete: 'restrict' }).notNull(),
    title: varchar('title').notNull(),
    title_bn: varchar('title_bn'),
    description: text('description'),
    description_bn: text('description_bn'),
    type: propertyTypeEnum('type').notNull(),
    price: decimal('price', { precision: 12, scale: 2 }).notNull(), // Supports large values
    sizeSqft: integer('size_sqft'),
    roomCount: integer('room_count').notNull(),
    amenities: jsonb('amenities'), // e.g., ["Lift", "Generator"]
    amenities_bn: jsonb('amenities_bn'),
    status: propertyStatusEnum('status').default('pending').notNull(),
    viewsCount: integer('views_count').default(0).notNull(),
    lastActivityDate: timestamp('last_activity_date').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
    deletedAt: timestamp('deleted_at'), // Soft delete
});

// ==========================================
// 5. LOCATIONS (Separated for Paywall Security)
// ==========================================
export const propertyLocationsPublic = pgTable('property_locations_public', {
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).primaryKey(),
    approxLat: decimal('approx_lat', { precision: 9, scale: 6 }).notNull(),
    approxLng: decimal('approx_lng', { precision: 9, scale: 6 }).notNull(),
});

export const propertyLocationsPrivate = pgTable('property_locations_private', {
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).primaryKey(),
    exactAddress: text('exact_address').notNull(), // Encrypted at code level
    exactAddress_bn: text('exact_address_bn'),
    exactLat: decimal('exact_lat', { precision: 9, scale: 6 }).notNull(),
    exactLng: decimal('exact_lng', { precision: 9, scale: 6 }).notNull(),
});

// ==========================================
// 6. ASSETS & CONTACTS
// ==========================================
export const propertyImages = pgTable('property_images', {
    id: uuid('id').defaultRandom().primaryKey(),
    propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    imageUrl: text('image_url').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
});

export const ownerContacts = pgTable('owner_contacts', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    phone: text('phone').notNull(), // Encrypted
    whatsapp: text('whatsapp'),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ==========================================
// 7. PAYMENTS & ACCESS
// ==========================================
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    gateway: varchar('gateway'), // e.g., 'bKash'
    gatewayTrxId: varchar('gateway_trx_id').unique(),
    status: transactionStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const userSubscriptions = pgTable('user_subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'restrict' }).notNull(),
    startDate: timestamp('start_date').defaultNow().notNull(),
    endDate: timestamp('end_date').notNull(), // Will be set to 2 months from start_date
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 8. ENGAGEMENT & ALERTS
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
// 9. AUTHENTICATION (NextAuth.js)
// ==========================================

// Required for Google/OAuth login
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

// Required for OTP (Phone & Email)
export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(), // Phone number or Email
    token: text("token").notNull(),           // The actual OTP code
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});