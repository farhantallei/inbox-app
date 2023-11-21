import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"
import libsqlClient from "@/lib/libsql"

const db = drizzle(libsqlClient, { schema, logger: true })
export default db
