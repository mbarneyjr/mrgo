import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "#src/util/db.ts";
import { ConflictError } from "#src/util/errors.ts";
import { user } from "./user.schema.ts";

export class User {
  static schema = z
    .object({
      id: z.string().meta({
        example: "123",
      }),
      name: z.string().nullable().meta({
        example: "John Doe",
      }),
      email: z.string().meta({
        example: "email@email.com",
      }),
      isAdmin: z.boolean().meta({
        example: false,
      }),
    })
    .meta({ id: "User" });

  static async get(id: string) {
    const db = await getDb();
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0] ?? null;
  }

  static async create(data: z.input<typeof User.schema>) {
    const db = await getDb();
    try {
      const result = await db
        .insert(user)
        .values(User.schema.parse(data))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        });
      if (!result[0]) {
        throw new ConflictError("User not created");
      }
      return result[0];
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.includes("duplicate key value violates unique constraint")
        ) {
          throw new ConflictError("User already exists", undefined, err);
        }
      }
      throw err;
    }
  }
}
