import db from "@/db"
import { auth } from "@/middleware"
import plugins from "@/plugins"
import Elysia, { t } from "elysia"
import {
  user as userTable,
  inbox as inboxTable,
  usersOnInbox,
  messagesOnInbox,
} from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { and, eq, not } from "drizzle-orm"

const inbox = new Elysia().use(plugins).group("inbox", (app) =>
  app
    .use(auth)
    .get(
      ":inboxId",
      async ({ params, user }) => {
        const { inboxId } = params

        const inboxes = await db
          .select()
          .from(inboxTable)
          .where(eq(inboxTable.id, inboxId))

        if (!inboxes.length) throw new Error("Inbox does not exists")

        const friends = await db
          .select({
            id: userTable.id,
            username: userTable.username,
          })
          .from(usersOnInbox)
          .innerJoin(userTable, eq(usersOnInbox.userId, userTable.id))
          .where(
            and(
              eq(usersOnInbox.inboxId, inboxId),
              not(eq(usersOnInbox.userId, user.id))
            )
          )

        const messages = await db
          .select({
            id: messagesOnInbox.id,
            username: userTable.username,
            message: messagesOnInbox.message,
          })
          .from(messagesOnInbox)
          .leftJoin(userTable, eq(messagesOnInbox.userId, userTable.id))
          .where(eq(messagesOnInbox.inboxId, inboxId))

        return { friends, messages }
      },
      {
        params: t.Object({
          inboxId: t.String(),
        }),
      }
    )
    .get("list", async ({ user }) => {
      const inboxes = await db
        .select({ id: inboxTable.id })
        .from(inboxTable)
        .leftJoin(usersOnInbox, eq(usersOnInbox.inboxId, inboxTable.id))
        .where(eq(usersOnInbox.userId, user.id))

      return inboxes
    })
    .post("create", async ({ user }) => {
      const inboxId = createId()

      await db.transaction(async (tx) => {
        await tx.insert(inboxTable).values({ id: inboxId, userId: user.id })
        await tx.insert(usersOnInbox).values({ userId: user.id, inboxId })
      })

      return { inboxId }
    })
    .post(
      ":inboxId/invite",
      async ({ params, body, set }) => {
        const { inboxId } = params
        const { userIds } = body

        const inboxes = await db
          .select()
          .from(inboxTable)
          .where(eq(inboxTable.id, inboxId))
        if (!inboxes.length) throw new Error("Inbox does not exists")

        const userList = await db
          .select({
            id: usersOnInbox.userId,
          })
          .from(usersOnInbox)
          .where(eq(usersOnInbox.inboxId, inboxId))

        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i]
          const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, userId))
          if (!users.length)
            throw new Error(`User ${userId} on list does not exists`)

          if (userList.includes({ id: users[0].id })) continue

          await db.insert(usersOnInbox).values({ userId: users[0].id, inboxId })
        }

        set.status = 201
      },
      {
        params: t.Object({
          inboxId: t.String(),
        }),
        body: t.Object({
          userIds: t.Array(t.String()),
        }),
      }
    )
    .post(
      ":inboxId/send-message",
      async ({ params, body, user, set }) => {
        const { inboxId } = params
        const { message } = body

        const inboxes = await db
          .select()
          .from(inboxTable)
          .where(eq(inboxTable.id, inboxId))
        if (!inboxes.length) throw new Error("Inbox does not exists")

        await db
          .insert(messagesOnInbox)
          .values({ inboxId, userId: user.id, message })

        set.status = 201
      },
      {
        params: t.Object({
          inboxId: t.String(),
        }),
        body: t.Object({
          message: t.String(),
        }),
      }
    )
)
export default inbox
