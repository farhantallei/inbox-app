import db from "@/db"
import { user } from "@/db/schema"
import plugins from "@/plugins"
import jwt from "@/utils/jwt"
import { eq } from "drizzle-orm"
import Elysia, { t } from "elysia"

const auth = new Elysia().use(plugins).group("auth", (app) =>
  app
    .post("verify", async ({ headers, redis }) => {
      const authHeader = headers.authorization
      if (authHeader == null) throw new Error("Not authenticated")

      const token = authHeader.split(" ")[1]
      if (!token) throw new Error("Token is empty")

      const payload = await jwt.verify<{
        username: string
        sessionKey: string
      }>(token, "123123")

      const userSession = await redis.get(`user:${payload.username}`)

      if (payload.sessionKey !== userSession) throw new Error("Invalid session")

      return { username: payload.username }
    })
    .post(
      "login",
      async ({ body, redis }) => {
        const { username } = body

        const sessionKey = crypto.randomUUID()

        const token = await jwt.sign({ username, sessionKey }, "123123")

        const userSession = await redis.get(`user:${username}`)

        if (userSession) throw new Error("username exists")

        const users = await db
          .select()
          .from(user)
          .where(eq(user.username, username))

        if (!users.length) {
          await db.insert(user).values({ username })
        }

        await redis.set(`user:${username}`, sessionKey)

        return { id: users[0].id, username: users[0].username, token }
      },
      {
        body: t.Object({
          username: t.String(),
        }),
      }
    )
    .post("logout", async ({ headers, redis }) => {
      const authHeader = headers.authorization
      if (authHeader == null) throw new Error("Not authenticated")

      const token = authHeader.split(" ")[1]
      if (!token) throw new Error("Token is empty")

      const payload = jwt.decode<{
        username: string
        sessionKey: string
      }>(token)

      await redis.del(`user:${payload.username}`)
    })
)
export default auth
