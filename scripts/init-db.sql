-- SharePlate Database Initialization
-- This script runs on first container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Set timezone
SET TIMEZONE = 'UTC';

-- Note: Prisma migrations will handle actual table creation
-- This file ensures extensions are available
