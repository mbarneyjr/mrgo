import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  isAdmin: boolean("isAdmin").notNull(),
});
