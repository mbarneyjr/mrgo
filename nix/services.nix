{
  services.postgres.database = {
    enable = true;
    dataDir = "data.local/database";
    superuser = "postgres";
  };
  settings.processes.npm-ci = {
    command = ''
      npm ci --include dev
    '';
  };
  settings.processes.database-migrations = {
    command = ''
      cd packages/core
      npm run drizzle:migrate
    '';
    depends_on = {
      database = {
        condition = "process_healthy";
      };
      npm-ci = {
        condition = "process_completed";
      };
    };
  };
  settings.processes.drizzle-studio = {
    command = ''
      cd packages/core
      npm run drizzle:studio
    '';
    depends_on = {
      database-migrations = {
        condition = "process_completed";
      };
      npm-ci = {
        condition = "process_completed";
      };
    };
  };
  settings.processes.api = {
    command = ''
      cd packages/api
      node local/server.ts
    '';
    depends_on = {
      database-migrations = {
        condition = "process_completed";
      };
      npm-ci = {
        condition = "process_completed";
      };
    };
  };
}
