-- Migration: Add sharedReport table for public shareable interview reports
-- Run this SQL manually on your Neon database branch first.
-- DO NOT run drizzle-kit push.

CREATE TABLE IF NOT EXISTS "sharedReport" (
    "id" SERIAL PRIMARY KEY,
    "tokenHash" VARCHAR(64) NOT NULL UNIQUE,
    "mockId" VARCHAR(255) NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "includeAnswers" BOOLEAN NOT NULL DEFAULT FALSE,
    "expiresAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "revokedAt" TIMESTAMP WITH TIME ZONE
);

-- Note: The UNIQUE constraint on tokenHash already automatically creates a unique b-tree index.
-- Below are the indexes for interview lookup and creator-based operations:
CREATE INDEX IF NOT EXISTS "sharedReport_mockId_idx" ON "sharedReport" ("mockId");
CREATE INDEX IF NOT EXISTS "sharedReport_createdBy_idx" ON "sharedReport" ("createdBy");

