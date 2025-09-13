import { z } from "zod";

export const env = z
  .object({
    DB_HOST: z.string().default("localhost"),
    DB_BASTION_PROXY: z.string().optional(),
    DB_PORT: z
      .string()
      .default("5432")
      .transform((input) => parseInt(input, 10)),
    DB_USERNAME: z.string().default("postgres"),
    DB_PASSWORD: z.string().default("postgres"),
    DB_DATABASE: z.string().default("postgres"),
  })
  .parse(process.env);
