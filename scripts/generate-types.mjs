import { execSync } from "child_process";

const url =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api/v1/api-docs.json";

execSync(`openapi-typescript ${url} -o src/types/api.d.ts`, {
  stdio: "inherit",
});
