import { z } from "zod";

export const notFoundSchema = z.object({
  message: z.string().meta({ example: "not found!" }),
});
