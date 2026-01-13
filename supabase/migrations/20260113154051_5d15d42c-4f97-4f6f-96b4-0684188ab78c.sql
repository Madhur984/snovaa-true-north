-- =====================================================
-- SNOVAA COMPLETE DATABASE SCHEMA (FIXED)
-- Immutable Ledger Architecture
-- =====================================================

-- 1. First, add 'admin' and 'sponsor' to the app_role enum if not exists
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'sponsor';