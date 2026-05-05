import { pgTable, serial, text, boolean, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    phone: text('phone').unique().notNull(),
    isSubscribed: boolean('is_subscribed').default(false),
});

export const properties = pgTable('properties', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    bedrooms: integer('bedrooms').notNull(),
    price: integer('price').notNull(),
    address: text('address').notNull(),
    ownerPhone: text('owner_phone').notNull(),
    ownerId: uuid('owner_id').references(() => users.id).notNull(),
});

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    activeUntil: timestamp('active_until').notNull(),
});

// Define relations for easier querying
export const usersRelations = relations(users, ({ many }) => ({
    properties: many(properties),
    subscriptions: many(subscriptions),
}));

export const propertiesRelations = relations(properties, ({ one }) => ({
    owner: one(users, {
        fields: [properties.ownerId],
        references: [users.id],
    }),
}));