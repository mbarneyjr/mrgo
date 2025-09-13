import { app } from "@mrgo/api";
import { handle } from "hono/aws-lambda";

export const handler = handle(app);
