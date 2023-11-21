import { createId } from "@paralleldrive/cuid2"
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text("username").unique(),
})

export const inbox = sqliteTable("inbox", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
})

export const usersOnInbox = sqliteTable(
  "users_on_inbox",
  {
    inboxId: text("inbox_id").references(() => inbox.id),
    userId: text("user_id").references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.inboxId] }),
    }
  }
)

export const messagesOnInbox = sqliteTable("messages_on_inbox", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  inboxId: text("inbox_id")
    .notNull()
    .references(() => inbox.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  message: text("message"),
})
