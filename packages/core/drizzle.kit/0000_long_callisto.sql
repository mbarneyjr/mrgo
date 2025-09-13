CREATE TABLE "user" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"isAdmin" boolean NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
