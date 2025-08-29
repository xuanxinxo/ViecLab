-- Create indexes for faster search queries
CREATE INDEX IF NOT EXISTS "Job_status_idx" ON "Job" ("status");
CREATE INDEX IF NOT EXISTS "Job_title_idx" ON "Job" ("title");
CREATE INDEX IF NOT EXISTS "Job_location_idx" ON "Job" ("location");
CREATE INDEX IF NOT EXISTS "Job_type_idx" ON "Job" ("type");
CREATE INDEX IF NOT EXISTS "Job_postedDate_idx" ON "Job" ("postedDate" DESC);

-- Create a compound index for common search patterns
CREATE INDEX IF NOT EXISTS "Job_search_idx" ON "Job" ("status", "title", "location", "type");
