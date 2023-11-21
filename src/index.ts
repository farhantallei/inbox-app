import { Elysia, t } from "elysia"
import plugins from "@/plugins"
import routes from "@/routes"
import { createId } from "@paralleldrive/cuid2"
import db from "./db"
import { inbox, messagesOnInbox } from "./db/schema"
import { eq } from "drizzle-orm"

const port = process.env.PORT ? Number(process.env.PORT) : 3000

const ws = new Elysia()
  .ws("inbox/join", {
    body: t.Object({
      inboxId: t.String(),
    }),
    message(ws, { inboxId }) {
      // console.log("subscribe:", inboxId)
      ws.subscribe(inboxId)
      ws.send(inboxId)
    },
  })
  .ws("inbox/send-message", {
    query: t.Object({
      inboxId: t.String(),
      userId: t.String(),
      username: t.String(),
    }),
    body: t.Object({
      message: t.String(),
    }),
    open(ws) {
      ws.subscribe(ws.data.query.inboxId)
    },
    async message(ws, { message }) {
      const { inboxId, userId, username } = ws.data.query

      const messageId = createId()

      const inboxes = await db.select().from(inbox).where(eq(inbox.id, inboxId))
      if (!inboxes.length) throw new Error("Inbox does not exists")

      await db.insert(messagesOnInbox).values({ inboxId, userId, message })

      // if (isSubscribed) {
      ws.send({ id: messageId, username, message })
      ws.publish(inboxId, { id: messageId, username, message })
      // }

      // const user = ws.data.user

      // const messageId = createId()

      // ws.isSubscribed()

      // ws.send({ id: messageId, username: user.username, message })
    },
  })

const app = new Elysia().use(plugins).use(ws).use(routes).listen(port)

console.log(`🦊 Elysia is running at ${app.server?.url}`)
