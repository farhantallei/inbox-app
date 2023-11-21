import redisClient from "@/lib/redis"
import Elysia from "elysia"

// interface Props {
//   host?: string
//   port?: number
//   password?: string
// }

const redis = async () => {
  return new Elysia({ name: "redis" })
    .decorate("redis", redisClient)
    .onStop(async () => {
      await redisClient.disconnect()
    })
}
export default redis
