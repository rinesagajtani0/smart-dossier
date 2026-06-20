// Albanian Property Legal Basis for Smart Dossier
// Based on actual Albanian legislation and institutions

export const ALBANIAN_LEGAL_BASIS = {
  // Key Laws
  laws: [
    {
      name: "Law No. 111/2018",
      title: "On Cadastre",
      description: "Established the State Cadastre Agency (ASHK) by merging IPRO, ALUIZNI, and AKKP",
      keyPoints: [
        "Unified property registration system",
        "Digital cadastral services",
        "Integration of property data",
        "74 services for citizens and businesses"
      ]
    },
    {
      name: "Law No. 33/2012", 
      title: "On Registration of Immovable Property",
      description: "Governs the registration process for property rights",
      keyPoints: [
        "Property registration procedures",
        "Title establishment",
        "Registration fees and timelines",
        "Appeal processes"
      ]
    },
    {
      name: "Law No. 9482/2006",
      title: "On Legalization, Urban Planning and Integration of Illegal Constructions",
      description: "Legalization process for informal constructions",
      keyPoints: [
        "Self-declaration process for illegal buildings",
        "Urban planning requirements",
        "Compensation mechanisms for former owners",
        "ALUIZNI agency responsibilities"
      ]
    },
    {
      name: "Civil Code (1994)",
      title: "Civil Code of Albania",
      description: "Foundation of property rights in Albania",
      keyPoints: [
        "Property ownership rights",
        "Property transfer procedures",
        "Mortgage and lien regulations",
        "Property protection mechanisms"
      ]
    }
  ],

  // Real Albanian Institutions
  institutions: [
    {
      name: "ASHK",
      fullName: "Agjencia Shtetërore e Kadastrës (State Cadastre Agency)",
      role: "Central authority for property registration and cadastral services",
      responsibilities: [
        "Property registration",
        "Cadastral mapping",
        "Title issuance",
        "Legalization processes",
        "Property valuation",
        "Digital services"
      ]
    },
    {
      name: "Bashkia",
      fullName: "Municipality (Local Government Unit)",
      role: "Local authority for urban planning and construction permits",
      responsibilities: [
        "Urban planning permits",
        "Construction licenses",
        "Local zoning regulations",
        "Property tax assessment",
        "Local development plans"
      ]
    },
    {
      name: "Këshilli i Qarkut",
      fullName: "Regional Council",
      role: "Regional authority for larger urban planning decisions",
      responsibilities: [
        "Regional urban planning approval",
        "Territorial development plans",
        "Infrastructure coordination",
        "Inter-municipal property issues"
      ]
    },
    {
      name: "Gykata",
      fullName: "Court System",
      role: "Judicial authority for property disputes",
      responsibilities: [
        "Property dispute resolution",
        "Expropriation compensation disputes",
        "Ownership conflicts",
        "Title verification appeals"
      ]
    },
    {
      name: "Ministria e Financave",
      fullName: "Ministry of Finance",
      role: "Financial authority for property transactions and compensation",
      responsibilities: [
        "Property transaction taxes",
        "Compensation payments",
        "State property management",
        "Financial regulations"
      ]
    }
  ],

  // Typical Property Process Phases (based on Albanian procedures)
  processPhases: {
    propertyRegistration: [
      {
        phase: "Kërkesë Filluese",
        institution: "ASHK",
        description: "Initial property registration application",
        expectedDays: 2,
        requiredDocuments: ["Application form", "Identity document", "Ownership proof", "Cadastral plan"]
      },
      {
        phase: "Verifikim Kadastral",
        institution: "ASHK", 
        description: "Cadastral verification and mapping",
        expectedDays: 5,
        requiredDocuments: ["Cadastral survey", "Boundary verification", "Technical documentation"]
      },
      {
        phase: "Vlerësim i Pronës",
        institution: "ASHK",
        description: "Property valuation and assessment",
        expectedDays: 7,
        requiredDocuments: ["Valuation report", "Market analysis", "Property specifications"]
      },
      {
        phase: "Rishikim Ligjor",
        institution: "ASHK",
        description: "Legal review of documentation",
        expectedDays: 6,
        requiredDocuments: ["Legal verification", "Title search", "Compliance check"]
      },
      {
        phase: "Miratim dhe Regjistrim",
        institution: "ASHK",
        description: "Final approval and registration",
        expectedDays: 3,
        requiredDocuments: ["Final certificate", "Registration fee payment", "Title issuance"]
      }
    ],
    
    legalization: [
      {
        phase: "Vetëdeklarim",
        institution: "ALUIZNI/ASHK",
        description: "Self-declaration of illegal construction",
        expectedDays: 3,
        requiredDocuments: ["Self-declaration form", "Construction details", "Proof of possession"]
      },
      {
        phase: "Verifikim Teknik",
        institution: "ALUIZNI/ASHK",
        description: "Technical verification of construction",
        expectedDays: 10,
        requiredDocuments: ["Technical survey", "Structural assessment", "Compliance check"]
      },
      {
        phase: "Vlerësim për Kompensim",
        institution: "ALUIZNI/ASHK",
        description: "Valuation for compensation calculation",
        expectedDays: 7,
        requiredDocuments: ["Property valuation", "Land value assessment", "Compensation calculation"]
      },
      {
        phase: "Miratim Urbanistik",
        institution: "Bashkia",
        description: "Urban planning approval",
        expectedDays: 8,
        requiredDocuments: ["Urban plan compliance", "Zoning verification", "Infrastructure assessment"]
      },
      {
        phase: "Certifikim Legalizimi",
        institution: "ALUIZNI/ASHK",
        description: "Issuance of legalization certificate",
        expectedDays: 5,
        requiredDocuments: ["Legalization fee payment", "Final certificate", "Property registration"]
      }
    ]
  },

  // Critical Points (Common bottlenecks in Albanian property processes)
  criticalPoints: [
    {
      point: "Cadastral Survey Delays",
      phase: "Verifikim Kadastral",
      risk: "high",
      description: "Technical surveys and boundary verification often cause delays",
      mitigation: "Use digital cadastral data, schedule surveys in advance"
    },
    {
      point: "Compensation Disputes",
      phase: "Vlerësim për Kompensim", 
      risk: "high",
      description: "Former owners often contest compensation amounts",
      mitigation: "Use standardized valuation methods, clear legal basis"
    },
    {
      point: "Urban Planning Approval",
      phase: "Miratim Urbanistik",
      risk: "medium",
      description: "Municipal approvals can be slow due to bureaucratic processes",
      mitigation: "Early engagement with urban planning offices, complete documentation"
    },
    {
      point: "Title Search Issues",
      phase: "Rishikim Ligjor",
      risk: "medium", 
      description: "Historical property records may be incomplete or conflicting",
      mitigation: "Comprehensive title search, legal expert review"
    },
    {
      point: "Documentation Completeness",
      phase: "Kërkesë Filluese",
      risk: "medium",
      description: "Incomplete documentation causes rejections and delays",
      mitigation: "Document checklist, pre-submission review"
    }
  ],

  // Legal Context for AI
  legalContext: `
    Albanian property law is governed by the Civil Code (1994), Law No. 111/2018 "On Cadastre", 
    Law No. 33/2012 "On Registration of Immovable Property", and Law No. 9482/2006 "On Legalization, 
    Urban Planning and Integration of Illegal Constructions". The State Cadastre Agency (ASHK) is the 
    central authority for property registration, created in 2019 through the merger of the Immovable 
    Property Registration Office (IPRO), the Agency for Legalization, Urbanization, and Integration 
    of Informal Areas (ALUIZNI), and the National Housing Authority (AKKP). Property processes involve 
    multiple institutions including ASHK, Municipalities (Bashkia), Regional Councils, and the Court system. 
    Common bottlenecks include cadastral survey delays, compensation disputes, and urban planning approvals.
  `
};
