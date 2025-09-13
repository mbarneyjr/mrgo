import { readFileSync } from "node:fs";
import { join } from "node:path";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { userRoute } from "./routes/user.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const app = new OpenAPIHono();
app.get("/openapi/ui", swaggerUI({ url: "/openapi/doc" }));
app.doc("/openapi/doc", (c) => ({
  openapi: "3.0.3",
  info: {
    title: "mrgo",
    version: JSON.parse(
      readFileSync(join(__dirname, "../../../package.json")).toString(),
    ).version,
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "current",
    },
  ],
}));

app.get("/", (c) => {
  return c.json({ message: "Hello, World! I like pie." });
});

app.route("/users", userRoute);

export { app };
