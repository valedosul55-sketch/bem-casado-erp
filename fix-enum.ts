import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating enum type...");
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "alert_type" AS ENUM ('low_stock', 'system_error', 'other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log("Enum type created successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
