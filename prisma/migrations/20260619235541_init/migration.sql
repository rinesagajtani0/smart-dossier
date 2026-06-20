-- CreateTable
CREATE TABLE "Dossier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "processType" TEXT NOT NULL,
    "applicantName" TEXT,
    "ownerName" TEXT,
    "propertyLocation" TEXT,
    "propertyNumber" TEXT,
    "cadastralZone" TEXT,
    "propertyType" TEXT,
    "phase" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "deadline" DATETIME,
    "missingFieldsJson" TEXT NOT NULL DEFAULT '[]',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dossierId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "documentType" TEXT,
    "extractedText" TEXT NOT NULL,
    "extractedDataJson" TEXT NOT NULL DEFAULT '{}',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiOutput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dossierId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiOutput_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dossierId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "delayReason" TEXT,
    "totalDurationDays" INTEGER NOT NULL,
    "similarityTagsJson" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "CaseHistory_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processType" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "requiredDocumentsJson" TEXT NOT NULL DEFAULT '[]',
    "criticalPoint" BOOLEAN NOT NULL DEFAULT false,
    "expectedDays" INTEGER NOT NULL,
    "nextPhase" TEXT
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dossierId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Letter_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseHistory_dossierId_key" ON "CaseHistory"("dossierId");
