import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { User } from "@mrgo/core/user/user";
import { z } from "zod";

import { notFoundSchema } from "#src/schemas/responses/not-found.ts";

export const userRoute = new OpenAPIHono();

export const getUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.string().meta({ example: "1212121" }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: User.schema } },
      description: "Retrieve the user",
    },
    404: {
      content: { "application/json": { schema: notFoundSchema } },
      description: "Retrieve the user",
    },
  },
});

userRoute.openapi(getUserRoute, async (c) => {
  const user = await User.get(c.req.param("id"));
  if (!user) return c.json({ message: "User not found" }, 404);
  return c.json(user, 200);
});
