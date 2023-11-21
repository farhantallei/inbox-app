import { createClient } from "@libsql/client"

const libsqlClient = createClient({
  url: Bun.env.DATABASE_URL!,
  authToken: Bun.env.DATABASE_AUTH_TOKEN,
})

export default libsqlClient
