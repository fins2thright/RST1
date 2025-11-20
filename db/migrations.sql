-- db/migrations.sql
-- This script contains all schema changes and migrations
-- It should NOT drop existing data, only add new tables and columns
-- Run this script to apply new schema changes to an existing database

USE [RSTdb1];
GO

-- Migration 1: Add Companies and WorkHistory tables (safe to run multiple times)
IF OBJECT_ID('dbo.Companies', 'U') IS NULL
BEGIN
    PRINT 'Creating Companies table...';
    CREATE TABLE dbo.Companies (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        CompanyName NVARCHAR(200) NOT NULL UNIQUE,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    INSERT INTO dbo.Companies (CompanyName, Description)
    VALUES (N'TechCorp', N'Technology consulting firm'),
           (N'DataSystems', N'Data analytics and solutions'),
           (N'CloudServices Inc', N'Cloud infrastructure provider');
    
    PRINT 'Companies table created successfully.';
END
ELSE
BEGIN
    PRINT 'Companies table already exists. Skipping...';
END

IF OBJECT_ID('dbo.WorkHistory', 'U') IS NULL
BEGIN
    PRINT 'Creating WorkHistory table...';
    CREATE TABLE dbo.WorkHistory (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ResourceId UNIQUEIDENTIFIER NOT NULL,
        CompanyId UNIQUEIDENTIFIER NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NULL,
        IsCurrentAssignment BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_WorkHistory_Resources FOREIGN KEY (ResourceId) REFERENCES dbo.HumanResources(Id) ON DELETE CASCADE,
        CONSTRAINT FK_WorkHistory_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(Id) ON DELETE CASCADE
    );
    
    PRINT 'WorkHistory table created successfully.';
END
ELSE
BEGIN
    PRINT 'WorkHistory table already exists. Skipping...';
END

-- Add future migrations here following the same pattern
-- Example:
-- IF OBJECT_ID('dbo.NewTable', 'U') IS NULL
-- BEGIN
--     PRINT 'Creating NewTable...';
--     CREATE TABLE dbo.NewTable ( ... );
--     PRINT 'NewTable created successfully.';
-- END
-- ELSE
-- BEGIN
--     PRINT 'NewTable already exists. Skipping...';
-- END

PRINT 'Migration script completed.';
