export const ALBANIAN_LEGAL_BASIS = {
  legalContext:
    "Albanian property procedures (registration, expropriation, and EKB privatization) are administered " +
    "through ASHK (cadastral verification and ownership certificates), municipalities (intake, citizen " +
    "communication, and final approval), valuation offices (compensation and market assessments), and legal " +
    "departments (compliance review and decision drafting). Core legal basis includes Law No. 111/2018 (On " +
    "Cadastre), Law No. 33/2012 (On Registration of Immovable Property), Law No. 9482/2006 (On Legalization), " +
    "and the Civil Code, which together govern ownership, registration, valuation, notification, and dossier " +
    "completeness requirements.",

  sources: [
    {
      id: "qbz",
      name: "Qendra e Botimeve Zyrtare",
      url: "https://qbz.gov.al/",
      use: "Primary source for Albanian laws and bylaws."
    },
    {
      id: "ashk",
      name: "Agjencia Shteterore e Kadastres",
      url: "https://www.ashk.gov.al/",
      use: "Institutional source for cadastral services, property registration, certificates, and ASHK procedures."
    },
    {
      id: "e-albania",
      name: "e-Albania",
      url: "https://e-albania.al/",
      use: "Digital public service descriptions and citizen-facing application requirements."
    },
    {
      id: "challenge-diagrams",
      name: "Innovation4Albania challenge diagrams",
      url: null,
      use: "Provided manual for Expropriation and EKB Privatization phases, institutions, legal basis, and critical points."
    }
  ],

  laws: [
    {
      id: "law-111-2018",
      name: "Law No. 111/2018",
      title: "On Cadastre",
      source: "qbz",
      tags: ["cadastre", "ashk", "registration"],
      summary:
        "Framework law for the State Cadastre Agency and cadastral/property registration functions."
    },
    {
      id: "law-33-2012",
      name: "Law No. 33/2012",
      title: "On Registration of Immovable Property",
      source: "qbz",
      tags: ["registration", "immovable-property", "title"],
      summary:
        "Legal basis for registration of immovable property rights and related documentation."
    },
    {
      id: "civil-code",
      name: "Civil Code",
      title: "Civil Code of the Republic of Albania",
      source: "qbz",
      tags: ["ownership", "transfer", "property-rights"],
      summary:
        "General legal basis for ownership, transfer, and protection of property rights."
    },
    {
      id: "law-9482-2006",
      name: "Law No. 9482/2006",
      title: "On the Legalization and Urban Integration of Informal Constructions",
      source: "qbz",
      tags: ["legalization", "informal-construction", "self-declaration"],
      summary:
        "Legal basis for self-declaration, technical verification, and legalization of informal or illegal constructions."
    },
    {
      id: "expropriation-law",
      name: "Expropriation legal framework",
      title: "Public interest expropriation procedure",
      source: "challenge-diagrams",
      tags: ["expropriation", "compensation", "public-interest"],
      summary:
        "Challenge-provided process model for property expropriation, including valuation, notification, objection, and decision steps."
    },
    {
      id: "ekb-privatization-framework",
      name: "EKB privatization framework",
      title: "Privatization of public/social housing dossiers",
      source: "challenge-diagrams",
      tags: ["ekb", "privatization", "housing"],
      summary:
        "Challenge-provided process model for EKB privatization dossiers and institution handoffs."
    }
  ],

  institutions: [
    {
      id: "ashk",
      name: "ASHK",
      fullName: "Agjencia Shteterore e Kadastres",
      responsibilities: [
        "property registration",
        "cadastral verification",
        "ownership certificates",
        "property maps and cadastral data"
      ]
    },
    {
      id: "municipality",
      name: "Municipality",
      fullName: "Bashkia",
      responsibilities: [
        "local intake",
        "citizen communication",
        "urban planning information",
        "local administrative coordination"
      ]
    },
    {
      id: "valuation-office",
      name: "Valuation Office",
      fullName: "Property valuation unit",
      responsibilities: [
        "valuation report",
        "compensation estimate",
        "market and infrastructure impact assessment"
      ]
    },
    {
      id: "legal-department",
      name: "Legal Department",
      fullName: "Institutional legal review unit",
      responsibilities: [
        "legal completeness review",
        "ownership mismatch review",
        "decision and letter drafting"
      ]
    },
    {
      id: "ekb",
      name: "EKB",
      fullName: "Enti Kombetar i Banesave",
      responsibilities: [
        "housing privatization dossier review",
        "beneficiary verification",
        "contract and payment documentation"
      ]
    }
  ],

  processTemplates: {
    propertyRegistration: {
      id: "property-registration",
      label: "Property Registration",
      legalBasis: ["law-111-2018", "law-33-2012", "civil-code"],
      steps: [
        {
          phase: "Intake",
          institution: "Municipality",
          expectedDays: 2,
          requiredDocuments: ["application form", "identity document"],
          criticalPoint: false,
          nextPhase: "ASHK Check"
        },
        {
          phase: "ASHK Check",
          institution: "ASHK",
          expectedDays: 5,
          requiredDocuments: ["ownership certificate", "property number", "cadastral zone"],
          criticalPoint: true,
          nextPhase: "Property Valuation"
        },
        {
          phase: "Property Valuation",
          institution: "Valuation Office",
          expectedDays: 7,
          requiredDocuments: ["valuation report", "tax clearance"],
          criticalPoint: true,
          nextPhase: "Legal Review"
        },
        {
          phase: "Legal Review",
          institution: "Legal Department",
          expectedDays: 6,
          requiredDocuments: ["ownership certificate", "owner consent"],
          criticalPoint: true,
          nextPhase: "Final Approval"
        },
        {
          phase: "Final Approval",
          institution: "Municipality",
          expectedDays: 3,
          requiredDocuments: ["complete dossier"],
          criticalPoint: false,
          nextPhase: null
        }
      ]
    },

    expropriation: {
      id: "expropriation",
      label: "Expropriation",
      legalBasis: ["expropriation-law", "law-111-2018", "civil-code"],
      steps: [
        {
          phase: "Public Interest Request",
          institution: "Municipality",
          expectedDays: 3,
          requiredDocuments: ["public interest request", "project map", "affected property list"],
          criticalPoint: false,
          nextPhase: "Cadastral Verification"
        },
        {
          phase: "Cadastral Verification",
          institution: "ASHK",
          expectedDays: 7,
          requiredDocuments: ["ownership certificate", "cadastral map", "property boundaries"],
          criticalPoint: true,
          nextPhase: "Valuation and Compensation"
        },
        {
          phase: "Valuation and Compensation",
          institution: "Valuation Office",
          expectedDays: 10,
          requiredDocuments: ["valuation report", "market comparison", "compensation calculation"],
          criticalPoint: true,
          nextPhase: "Owner Notification"
        },
        {
          phase: "Owner Notification",
          institution: "Municipality",
          expectedDays: 5,
          requiredDocuments: ["notification letter", "proof of delivery", "objection deadline"],
          criticalPoint: true,
          nextPhase: "Legal Decision"
        },
        {
          phase: "Legal Decision",
          institution: "Legal Department",
          expectedDays: 8,
          requiredDocuments: ["legal opinion", "final decision draft", "compensation approval"],
          criticalPoint: true,
          nextPhase: "Execution and Archive"
        },
        {
          phase: "Execution and Archive",
          institution: "Municipality",
          expectedDays: 4,
          requiredDocuments: ["payment confirmation", "archive record", "handoff confirmation"],
          criticalPoint: false,
          nextPhase: null
        }
      ]
    },

    ekbPrivatization: {
      id: "ekb-privatization",
      label: "EKB Privatization",
      legalBasis: ["ekb-privatization-framework", "law-111-2018", "civil-code"],
      steps: [
        {
          phase: "Applicant Intake",
          institution: "EKB",
          expectedDays: 2,
          requiredDocuments: ["application form", "identity document", "housing contract"],
          criticalPoint: false,
          nextPhase: "Beneficiary Verification"
        },
        {
          phase: "Beneficiary Verification",
          institution: "EKB",
          expectedDays: 6,
          requiredDocuments: ["family certificate", "eligibility proof", "payment history"],
          criticalPoint: true,
          nextPhase: "Property Verification"
        },
        {
          phase: "Property Verification",
          institution: "ASHK",
          expectedDays: 7,
          requiredDocuments: ["property number", "cadastral zone", "ownership status"],
          criticalPoint: true,
          nextPhase: "Contract Preparation"
        },
        {
          phase: "Contract Preparation",
          institution: "Legal Department",
          expectedDays: 5,
          requiredDocuments: ["contract draft", "payment calculation", "legal review"],
          criticalPoint: true,
          nextPhase: "Final Approval"
        },
        {
          phase: "Final Approval",
          institution: "EKB",
          expectedDays: 3,
          requiredDocuments: ["signed contract", "payment confirmation", "archive record"],
          criticalPoint: false,
          nextPhase: null
        }
      ]
    }
  },

  criticalPoints: [
    {
      id: "missing-ownership-certificate",
      processTypes: ["property-registration", "expropriation"],
      phase: "ASHK Check",
      risk: "high",
      triggerFields: ["ownership certificate"],
      alert: "Ownership certificate is missing or unclear.",
      recommendedAction: "Request updated ownership certificate from ASHK before advancing.",
      legalBasisIds: ["law-33-2012", "civil-code"]
    },
    {
      id: "missing-valuation-report",
      processTypes: ["property-registration", "expropriation"],
      phase: "Property Valuation",
      risk: "high",
      triggerFields: ["valuation report"],
      alert: "Valuation report is missing, which commonly blocks the dossier.",
      recommendedAction: "Request valuation report and attach it to the dossier today.",
      legalBasisIds: ["expropriation-law", "law-33-2012"]
    },
    {
      id: "cadastral-data-unclear",
      processTypes: ["property-registration", "expropriation", "ekb-privatization"],
      phase: "Cadastral Verification",
      risk: "high",
      triggerFields: ["property number", "cadastral zone"],
      alert: "Cadastral identifiers are incomplete or inconsistent.",
      recommendedAction: "Verify property number and cadastral zone with ASHK.",
      legalBasisIds: ["law-111-2018"]
    },
    {
      id: "owner-notification-risk",
      processTypes: ["expropriation"],
      phase: "Owner Notification",
      risk: "high",
      triggerFields: ["proof of delivery", "objection deadline"],
      alert: "Notification delivery or objection deadline is not documented.",
      recommendedAction: "Generate notification letter and record proof of delivery.",
      legalBasisIds: ["expropriation-law"]
    },
    {
      id: "ekb-beneficiary-mismatch",
      processTypes: ["ekb-privatization"],
      phase: "Beneficiary Verification",
      risk: "medium",
      triggerFields: ["eligibility proof", "payment history"],
      alert: "Beneficiary or payment history information is incomplete.",
      recommendedAction: "Request eligibility and payment history confirmation from EKB records.",
      legalBasisIds: ["ekb-privatization-framework"]
    }
  ],

  regulatoryUpdates: [
    {
      id: "cadastre-digital-map-required",
      effectiveDate: "2026-01-01",
      title: "Digital cadastral map required for cadastral verification",
      appliesToProcessTypes: ["property-registration", "expropriation", "ekb-privatization"],
      appliesToPhases: ["ASHK Check", "Cadastral Verification", "Property Verification"],
      newRequiredDocuments: ["digital cadastral map"],
      changedFields: ["cadastralZone", "propertyNumber", "boundaryCoordinates"],
      reason:
        "Curated regulatory scenario modeled on ASHK's shift toward digital cadastral mapping under Law No. 111/2018: cadastral verification now requires a georeferenced digital map to reduce boundary disputes between neighboring parcels.",
      source: "challenge-diagrams"
    },
    {
      id: "owner-notification-proof-required",
      effectiveDate: "2026-02-15",
      title: "Proof of delivery required for owner notifications",
      appliesToProcessTypes: ["expropriation"],
      appliesToPhases: ["Owner Notification", "Legal Decision"],
      newRequiredDocuments: ["proof of delivery", "objection deadline notice"],
      changedFields: ["notificationDate", "deliveryMethod", "objectionDeadline"],
      reason:
        "Curated regulatory scenario reflecting due-process requirements for expropriation: owners must receive a documented notification with proof of delivery and a clearly stated objection deadline before the legal decision phase proceeds.",
      source: "challenge-diagrams"
    },
    {
      id: "ekb-payment-history-required",
      effectiveDate: "2026-03-01",
      title: "EKB payment history must be attached before contract preparation",
      appliesToProcessTypes: ["ekb-privatization"],
      appliesToPhases: ["Beneficiary Verification", "Contract Preparation"],
      newRequiredDocuments: ["payment history confirmation"],
      changedFields: ["paymentHistory", "beneficiaryStatus"],
      reason:
        "Curated regulatory scenario reflecting EKB practice of requiring verified payment history before drafting privatization contracts, reducing the risk of disputes over outstanding balances after contract signature.",
      source: "challenge-diagrams"
    },
    {
      id: "valuation-market-appendix-required",
      effectiveDate: "2026-04-01",
      title: "Valuation report must include market comparison appendix",
      appliesToProcessTypes: ["property-registration", "expropriation"],
      appliesToPhases: ["Property Valuation", "Valuation and Compensation"],
      newRequiredDocuments: ["market comparison appendix", "valuation methodology note"],
      changedFields: ["valuationMethod", "marketComparableProperties", "valuationDate"],
      reason:
        "Curated regulatory scenario reflecting valuation-office practice of attaching a market comparison appendix and methodology note, so compensation and property-value decisions remain auditable and defensible on appeal.",
      source: "challenge-diagrams"
    }
  ],

  propertyWatchlist: [
    {
      propertyNumber: "P-102/44",
      type: "demolition-risk",
      severity: "critical",
      title: "Municipal demolition review signal",
      message:
        "This property is on a synthetic municipal review list for possible demolition or structural intervention.",
      recommendedAction:
        "Notify the assigned civil servant and request construction permit, structural safety certificate, and municipal inspection note."
    },
    {
      propertyNumber: "P-210/4",
      type: "public-project-risk",
      severity: "high",
      title: "Possible road project impact",
      message:
        "This property is on a synthetic infrastructure watchlist and may be affected by a road expansion corridor.",
      recommendedAction:
        "Check project map, affected property list, and owner notification requirements before advancing."
    }
  ],

  propertyAlertRules: [
    {
      id: "demolition-risk-unsafe-building",
      severity: "critical",
      type: "demolition-risk",
      triggers: {
        propertyTypes: ["house", "commercial"],
        locations: ["Prishtina", "Durres", "Vlore"],
        missingFields: ["structural safety certificate", "construction permit"],
        keywords: ["unsafe", "demolition", "structural risk", "illegal construction"]
      },
      title: "Possible demolition or structural-risk action",
      message:
        "This property may require urgent review because demolition/structural-risk indicators were detected.",
      recommendedAction:
        "Notify the responsible officer, request construction permit and structural safety certificate, and block final approval until reviewed."
    },
    {
      id: "public-project-expropriation-risk",
      severity: "high",
      type: "public-project-risk",
      triggers: {
        propertyTypes: ["land", "house"],
        locations: ["Prishtina", "Tirana", "Durres"],
        missingFields: ["project map", "public interest request"],
        keywords: ["road project", "infrastructure", "public interest", "expropriation"]
      },
      title: "Possible public-project or expropriation impact",
      message:
        "The property may be affected by a public project or expropriation workflow.",
      recommendedAction:
        "Check project map, affected property list, and owner notification requirements."
    }
  ]
};

export function findProcessTemplate(processType) {
  return Object.values(ALBANIAN_LEGAL_BASIS.processTemplates).find(
    (template) => template.id === processType
  );
}

function findLaws(lawIds = []) {
  return lawIds
    .map((id) => ALBANIAN_LEGAL_BASIS.laws.find((law) => law.id === id))
    .filter(Boolean);
}

export function getLegalBasisForProcess(processType) {
  const template = findProcessTemplate(processType);
  if (!template) return [];

  return findLaws(template.legalBasis);
}

export function resolveLegalBasis(lawIds = []) {
  return findLaws(lawIds).map((law) => ({
    id: law.id,
    name: law.name,
    title: law.title,
    source: law.source
  }));
}
