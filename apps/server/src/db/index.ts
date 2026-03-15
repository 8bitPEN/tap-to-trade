import postgres from "postgres";

const sql = postgres(
  process.env.DATABASE_URL || "postgresql://localhost:5432/tap_to_trade"
);

export default sql;
