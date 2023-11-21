import { createClient } from "redis"

const redisClient = await createClient({
  password: Bun.env.REDIS_PASSWORD,
  socket: {
    host: Bun.env.REDIS_HOST,
    port: Bun.env.REDIS_PORT ? Number(Bun.env.REDIS_PORT) : undefined,
  },
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect()

export default redisClient
