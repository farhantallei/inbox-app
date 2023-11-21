import Elysia from "elysia"
import redis from "./redis"
import cors from "@elysiajs/cors"

const plugins = new Elysia()
  .use(redis())
  .use(
    cors({
      origin: [
        "localhost:4321",
        "inbox-app-sigma.vercel.app",
        "inbox-n92doyg0l-farhantallei.vercel.app",
      ],
    })
  )
export default plugins
