#!/usr/bin/env node

import { serve } from "@hono/node-server";
import { app } from "@mrgo/api";

serve(app, (info) => {
  console.log(`api base url    http://localhost:${info.port}`);
  console.log(`openapi docs    http://localhost:${info.port}/openapi/ui`);
});
