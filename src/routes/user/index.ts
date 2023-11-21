import db from "@/db"
import plugins from "@/plugins"
import Elysia from "elysia"
import { user as userTable } from "@/db/schema"
import { auth } from "@/middleware"
import { eq, not } from "drizzle-orm"

const user = new Elysia().use(plugins).group("user", (app) =>
  app.use(auth).get("list", async ({ user }) => {
    const users = await db
      .select()
      .from(userTable)
      .where(not(eq(userTable.username, user.username)))
    return users
  })
)
export default user
