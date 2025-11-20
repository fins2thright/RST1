USE [RSTdb1];
GO

-- Create Users table (only if it doesn't exist)
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL
    );

    INSERT INTO dbo.Users (Name) VALUES (N'Alice'), (N'Bob');
END

-- Create HumanResources table (only if it doesn't exist)
IF OBJECT_ID('dbo.HumanResources', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.HumanResources (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NULL,
        Position NVARCHAR(150) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    INSERT INTO dbo.HumanResources (FirstName, LastName, Email, Position)
    VALUES (N'Jane', N'Doe', N'jane.doe@example.com', N'Engineer'),
           (N'John', N'Smith', N'john.smith@example.com', N'Manager');
END

-- Create Skills table (only if it doesn't exist)
IF OBJECT_ID('dbo.Skills', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Skills (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        SkillName NVARCHAR(150) NOT NULL UNIQUE,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    INSERT INTO dbo.Skills (SkillName, Description)
    VALUES (N'.NET Coding', N'C# and .NET Framework development'),
           (N'Scrum Master', N'Agile scrum methodologies'),
           (N'React UX', N'React and user experience design');
END

-- Create ResourceSkills junction table (only if it doesn't exist)
IF OBJECT_ID('dbo.ResourceSkills', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ResourceSkills (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        ResourceId UNIQUEIDENTIFIER NOT NULL,
        SkillId UNIQUEIDENTIFIER NOT NULL,
        ProficiencyLevel NVARCHAR(50) NULL DEFAULT N'Intermediate',
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ResourceSkills_Resources FOREIGN KEY (ResourceId) REFERENCES dbo.HumanResources(Id) ON DELETE CASCADE,
        CONSTRAINT FK_ResourceSkills_Skills FOREIGN KEY (SkillId) REFERENCES dbo.Skills(Id) ON DELETE CASCADE,
        CONSTRAINT UQ_ResourceSkills_Unique UNIQUE (ResourceId, SkillId)
    );
END

-- Create Companies table (only if it doesn't exist)
IF OBJECT_ID('dbo.Companies', 'U') IS NULL
BEGIN
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
END

-- Create WorkHistory table (only if it doesn't exist)
IF OBJECT_ID('dbo.WorkHistory', 'U') IS NULL
BEGIN
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
END

