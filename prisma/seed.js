import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const processSteps = [
  {
    phase: "Kërkesë Filluese",
    institution: "ASHK",
    requiredDocuments: ["Application form", "Identity document", "Ownership proof", "Cadastral plan"],
    criticalPoint: false,
    expectedDays: 2,
    nextPhase: "Verifikim Kadastral"
  },
  {
    phase: "Verifikim Kadastral",
    institution: "ASHK",
    requiredDocuments: ["Cadastral survey", "Boundary verification", "Technical documentation"],
    criticalPoint: true,
    expectedDays: 5,
    nextPhase: "Vlerësim i Pronës"
  },
  {
    phase: "Vlerësim i Pronës",
    institution: "ASHK",
    requiredDocuments: ["Valuation report", "Market analysis", "Property specifications"],
    criticalPoint: true,
    expectedDays: 7,
    nextPhase: "Rishikim Ligjor"
  },
  {
    phase: "Rishikim Ligjor",
    institution: "ASHK",
    requiredDocuments: ["Legal verification", "Title search", "Compliance check"],
    criticalPoint: true,
    expectedDays: 6,
    nextPhase: "Miratim dhe Regjistrim"
  },
  {
    phase: "Miratim dhe Regjistrim",
    institution: "ASHK",
    requiredDocuments: ["Final certificate", "Registration fee payment", "Title issuance"],
    criticalPoint: false,
    expectedDays: 3,
    nextPhase: null
  }
];

const cases = [
  ["EXP-001", "Arta Gashi", "Luan Gashi", "Prishtina", "P-102/44", "Prishtina-1", "apartment", "Vlerësim i Pronës", "ASHK", "open", "high", ["Valuation report"], "delayed", 11, "missing valuation report", 28],
  ["EXP-002", "Besnik Krasniqi", "Besnik Krasniqi", "Prishtina", "P-118/22", "Prishtina-1", "apartment", "Vlerësim i Pronës", "ASHK", "closed", "high", ["Valuation report"], "delayed", 13, "missing valuation report", 31],
  ["EXP-003", "Drita Berisha", "Ilir Berisha", "Prizren", "PRZ-77/9", "Prizren-3", "house", "Verifikim Kadastral", "ASHK", "closed", "medium", ["Ownership certificate"], "delayed", 8, "missing ownership certificate", 24],
  ["EXP-004", "Nora Hoxha", "Nora Hoxha", "Peja", "PE-44/11", "Peja-2", "land", "Rishikim Ligjor", "ASHK", "closed", "high", ["Owner consent"], "rejected", 0, "ownership mismatch", 18],
  ["EXP-005", "Arben Hoti", "Arben Hoti", "Gjakova", "GJ-15/80", "Gjakova-4", "commercial", "Miratim dhe Regjistrim", "ASHK", "closed", "low", [], "approved", 0, null, 15],
  ["EXP-006", "Mira Shala", "Mira Shala", "Ferizaj", "FE-90/12", "Ferizaj-2", "apartment", "Verifikim Kadastral", "ASHK", "closed", "low", [], "approved", 0, null, 13],
  ["EXP-007", "Valon Morina", "Agim Morina", "Prishtina", "P-210/4", "Prishtina-2", "house", "Vlerësim i Pronës", "ASHK", "closed", "high", ["Valuation report", "Tax clearance"], "delayed", 14, "missing valuation report and tax clearance", 35],
  ["EXP-008", "Elira Deda", "Elira Deda", "Mitrovica", "MI-63/2", "Mitrovica-1", "land", "Verifikim Kadastral", "ASHK", "closed", "medium", ["Cadastral zone"], "delayed", 6, "unclear cadastral zone", 22],
  ["EXP-009", "Gent Rexha", "Gent Rexha", "Prizren", "PRZ-18/1", "Prizren-1", "commercial", "Rishikim Ligjor", "ASHK", "closed", "medium", ["Owner consent"], "approved", 0, null, 20],
  ["EXP-010", "Aulona Meta", "Blerim Meta", "Peja", "PE-109/6", "Peja-2", "apartment", "Rishikim Ligjor", "ASHK", "closed", "high", ["Ownership certificate"], "rejected", 0, "ownership mismatch", 17],
  ["EXP-011", "Liridon Kelmendi", "Liridon Kelmendi", "Prishtina", "P-311/19", "Prishtina-3", "land", "Vlerësim i Pronës", "ASHK", "closed", "low", [], "approved", 0, null, 16],
  ["EXP-012", "Era Limani", "Era Limani", "Gjilan", "GI-45/23", "Gjilan-1", "house", "Verifikim Kadastral", "ASHK", "closed", "medium", ["Property number"], "delayed", 5, "incorrect property number", 21],
  ["EXP-013", "Flamur Bytyqi", "Flamur Bytyqi", "Prishtina", "P-404/5", "Prishtina-1", "apartment", "Vlerësim i Pronës", "ASHK", "closed", "high", ["Valuation report"], "delayed", 10, "missing valuation report", 27],
  ["EXP-014", "Alma Rugova", "Alma Rugova", "Prizren", "PRZ-51/10", "Prizren-2", "house", "Miratim dhe Regjistrim", "ASHK", "closed", "low", [], "approved", 0, null, 14],
  ["EXP-015", "Krenar Selmani", "Krenar Selmani", "Peja", "PE-61/41", "Peja-1", "land", "Kërkesë Filluese", "ASHK", "open", "medium", ["Identity document"], "delayed", 3, "missing identity document", 12],
  ["EXP-016", "Teuta Ismaili", "Arsim Ismaili", "Ferizaj", "FE-72/7", "Ferizaj-2", "commercial", "Rishikim Ligjor", "ASHK", "closed", "high", ["Owner consent"], "rejected", 0, "owner consent not provided", 19],
  ["EXP-017", "Rina Osmani", "Rina Osmani", "Gjilan", "GI-88/12", "Gjilan-3", "apartment", "Vlerësim i Pronës", "ASHK", "closed", "medium", ["Tax clearance"], "delayed", 7, "missing tax clearance", 23],
  ["EXP-018", "Altin Zeqiri", "Altin Zeqiri", "Mitrovica", "MI-20/5", "Mitrovica-2", "house", "Verifikim Kadastral", "ASHK", "closed", "low", [], "approved", 0, null, 15],
  ["EXP-019", "Lea Mustafa", "Lea Mustafa", "Prishtina", "P-122/2", "Prishtina-1", "commercial", "Vlerësim i Pronës", "ASHK", "open", "high", ["Valuation report"], "delayed", 9, "missing valuation report", 26],
  ["EXP-020", "Fisnik Gashi", "Besa Gashi", "Prizren", "PRZ-98/8", "Prizren-3", "land", "Verifikim Kadastral", "ASHK", "closed", "high", ["Ownership certificate"], "rejected", 0, "ownership mismatch", 16],
  ["EXP-021", "Vesa Kola", "Vesa Kola", "Peja", "PE-11/4", "Peja-1", "apartment", "Miratim dhe Regjistrim", "ASHK", "closed", "low", [], "approved", 0, null, 12],
  ["EXP-022", "Dion Berisha", "Dion Berisha", "Gjakova", "GJ-55/15", "Gjakova-2", "house", "Vlerësim i Pronës", "ASHK", "closed", "medium", ["Valuation report"], "delayed", 8, "late valuation report", 25],
  ["EXP-023", "Sara Nikqi", "Sara Nikqi", "Ferizaj", "FE-34/6", "Ferizaj-1", "land", "Verifikim Kadastral", "ASHK", "open", "medium", ["Cadastral zone"], "delayed", 6, "unclear cadastral data", 20],
  ["EXP-024", "Ilir Daka", "Ilir Daka", "Prishtina", "P-501/8", "Prishtina-3", "house", "Rishikim Ligjor", "ASHK", "closed", "low", [], "approved", 0, null, 18]
];

function datePlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.letter.deleteMany();
  await prisma.aiOutput.deleteMany();
  await prisma.document.deleteMany();
  await prisma.caseHistory.deleteMany();
  await prisma.dossier.deleteMany();
  await prisma.processStep.deleteMany();

  for (const step of processSteps) {
    await prisma.processStep.create({
      data: {
        processType: "property-registration",
        phase: step.phase,
        institution: step.institution,
        requiredDocumentsJson: JSON.stringify(step.requiredDocuments),
        criticalPoint: step.criticalPoint,
        expectedDays: step.expectedDays,
        nextPhase: step.nextPhase
      }
    });
  }

  for (const [index, item] of cases.entries()) {
    const [
      code,
      applicantName,
      ownerName,
      location,
      propertyNumber,
      cadastralZone,
      propertyType,
      phase,
      institution,
      status,
      riskLevel,
      missingFields,
      outcome,
      delayDays,
      delayReason,
      totalDurationDays
    ] = item;

    const dossier = await prisma.dossier.create({
      data: {
        title: `${code} - ${location} ${propertyType}`,
        processType: "property-registration",
        applicantName,
        ownerName,
        propertyLocation: location,
        propertyNumber,
        cadastralZone,
        propertyType,
        phase,
        institution,
        status,
        deadline: datePlus((index % 9) + 1),
        missingFieldsJson: JSON.stringify(missingFields),
        riskLevel
      }
    });

    await prisma.caseHistory.create({
      data: {
        dossierId: dossier.id,
        outcome,
        delayDays,
        delayReason,
        totalDurationDays,
        similarityTagsJson: JSON.stringify([location, propertyType, phase, ...missingFields])
      }
    });

    await prisma.document.create({
      data: {
        dossierId: dossier.id,
        fileName: `${code.toLowerCase()}-sample.txt`,
        documentType: missingFields.length ? "partial dossier" : "complete dossier",
        extractedText: `Applicant: ${applicantName}. Owner: ${ownerName}. Property Number: ${propertyNumber}. Cadastral Zone: ${cadastralZone}. Location: ${location}. Document Type: ${missingFields.length ? "Partial Dossier" : "Complete Dossier"}.`,
        extractedDataJson: JSON.stringify({
          applicantName,
          ownerName,
          propertyNumber,
          cadastralZone,
          propertyLocation: location,
          documentType: missingFields.length ? "Partial Dossier" : "Complete Dossier",
          missingFields,
          confidence: 0.92
        })
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeded Smart Dossier AI data.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
