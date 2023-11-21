import Elysia from "elysia"
import auth from "./auth"
import user from "./user"
import inbox from "./inbox"

const routes = new Elysia().use(auth).use(user).use(inbox)
export default routes
