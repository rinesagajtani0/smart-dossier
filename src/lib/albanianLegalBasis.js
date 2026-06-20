export const ALBANIAN_LEGAL_BASIS = {
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
      recommendedAction: "Request updated ownership certificate from ASHK before advancing."
    },
    {
      id: "missing-valuation-report",
      processTypes: ["property-registration", "expropriation"],
      phase: "Property Valuation",
      risk: "high",
      triggerFields: ["valuation report"],
      alert: "Valuation report is missing, which commonly blocks the dossier.",
      recommendedAction: "Request valuation report and attach it to the dossier today."
    },
    {
      id: "cadastral-data-unclear",
      processTypes: ["property-registration", "expropriation", "ekb-privatization"],
      phase: "Cadastral Verification",
      risk: "high",
      triggerFields: ["property number", "cadastral zone"],
      alert: "Cadastral identifiers are incomplete or inconsistent.",
      recommendedAction: "Verify property number and cadastral zone with ASHK."
    },
    {
      id: "owner-notification-risk",
      processTypes: ["expropriation"],
      phase: "Owner Notification",
      risk: "high",
      triggerFields: ["proof of delivery", "objection deadline"],
      alert: "Notification delivery or objection deadline is not documented.",
      recommendedAction: "Generate notification letter and record proof of delivery."
    },
    {
      id: "ekb-beneficiary-mismatch",
      processTypes: ["ekb-privatization"],
      phase: "Beneficiary Verification",
      risk: "medium",
      triggerFields: ["eligibility proof", "payment history"],
      alert: "Beneficiary or payment history information is incomplete.",
      recommendedAction: "Request eligibility and payment history confirmation from EKB records."
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
        "Synthetic demo update: cadastral verification now requires a digital cadastral map to reduce boundary disputes.",
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
        "Synthetic demo update: expropriation dossiers must document owner notification and objection deadline.",
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
        "Synthetic demo update: payment history is required before preparing privatization contracts.",
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
        "Synthetic demo update: valuation phases now require a market comparison appendix to make compensation and property value decisions auditable.",
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

export function getLegalBasisForProcess(processType) {
  const template = findProcessTemplate(processType);
  if (!template) return [];

  return template.legalBasis
    .map((id) => ALBANIAN_LEGAL_BASIS.laws.find((law) => law.id === id))
    .filter(Boolean);
}
