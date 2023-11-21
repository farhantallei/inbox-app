import db from "@/db"
import { user } from "@/db/schema"
import plugins from "@/plugins"
import { jwt } from "@/utils"
import { eq } from "drizzle-orm"
import Elysia from "elysia"

const auth = new Elysia({ name: "middleware:auth" })
  .use(plugins)
  .derive(async ({ headers, redis }) => {
    const authHeader = headers.authorization
    if (authHeader == null) throw new Error("Not authenticated")

    const token = authHeader.split(" ")[1]
    if (!token) throw new Error("Token is empty")

    const payload = await jwt.verify<{
      username: string
      sessionKey: string
    }>(token, "123123")

    const users = await db
      .select()
      .from(user)
      .where(eq(user.username, payload.username))

    if (!users.length) throw new Error("User does not exists")

    const userSession = await redis.get(`user:${payload.username}`)

    if (payload.sessionKey !== userSession) throw new Error("Invalid session")

    return { user: { id: users[0].id, username: payload.username } }
  })
export default auth
