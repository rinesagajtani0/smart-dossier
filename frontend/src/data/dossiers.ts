import type { Dossier } from '../types/dossier';

export const dossiers: Dossier[] = [
  {
    id: 'd-1001',
    subject: 'Acme Holdings Ltd.',
    category: 'Corporate',
    status: 'active',
    riskLevel: 'high',
    summary:
      'Multinational holding company under review for irregular cross-border transactions flagged by compliance monitoring.',
    tags: ['finance', 'compliance', 'cross-border'],
    createdAt: '2026-04-02',
    updatedAt: '2026-06-12',
    events: [
      { id: 'e-1', date: '2026-04-02', description: 'Dossier opened after compliance flag.' },
      { id: 'e-2', date: '2026-05-10', description: 'Additional shell entities identified.' },
      { id: 'e-3', date: '2026-06-12', description: 'Risk level escalated to high.' },
    ],
    sources: [
      { id: 's-1', label: 'Internal compliance report #4471' },
      { id: 's-2', label: 'Public company registry', url: 'https://example.com/registry/acme' },
    ],
  },
  {
    id: 'd-1002',
    subject: 'Jonathan Reyes',
    category: 'Individual',
    status: 'active',
    riskLevel: 'medium',
    summary:
      'Background profile compiled in connection with a third-party vendor onboarding review.',
    tags: ['vendor-review', 'kyc'],
    createdAt: '2026-05-18',
    updatedAt: '2026-06-15',
    events: [
      { id: 'e-1', date: '2026-05-18', description: 'Vendor onboarding triggered profile creation.' },
      { id: 'e-2', date: '2026-06-15', description: 'Identity verification completed.' },
    ],
    sources: [
      { id: 's-1', label: 'Vendor onboarding form' },
    ],
  },
  {
    id: 'd-1003',
    subject: 'Northwind Logistics Co.',
    category: 'Corporate',
    status: 'draft',
    riskLevel: 'low',
    summary:
      'Preliminary dossier for a logistics partner pending initial due-diligence review.',
    tags: ['logistics', 'due-diligence'],
    createdAt: '2026-06-10',
    updatedAt: '2026-06-10',
    events: [
      { id: 'e-1', date: '2026-06-10', description: 'Dossier created, awaiting analyst assignment.' },
    ],
    sources: [],
  },
  {
    id: 'd-1004',
    subject: 'Helena Brandt',
    category: 'Individual',
    status: 'archived',
    riskLevel: 'low',
    summary:
      'Closed dossier from a prior partnership screening; no adverse findings reported.',
    tags: ['screening', 'closed'],
    createdAt: '2025-11-22',
    updatedAt: '2026-01-05',
    events: [
      { id: 'e-1', date: '2025-11-22', description: 'Screening initiated.' },
      { id: 'e-2', date: '2026-01-05', description: 'Dossier closed, no findings.' },
    ],
    sources: [
      { id: 's-1', label: 'Partnership screening report' },
    ],
  },
  {
    id: 'd-1005',
    subject: 'Orion Pharma Group',
    category: 'Corporate',
    status: 'active',
    riskLevel: 'medium',
    summary:
      'Ongoing monitoring of regulatory filings following a recent ownership restructuring.',
    tags: ['pharma', 'regulatory', 'ownership-change'],
    createdAt: '2026-03-14',
    updatedAt: '2026-06-08',
    events: [
      { id: 'e-1', date: '2026-03-14', description: 'Ownership restructuring detected.' },
      { id: 'e-2', date: '2026-06-08', description: 'Regulatory filing review completed.' },
    ],
    sources: [
      { id: 's-1', label: 'Regulatory filing database', url: 'https://example.com/filings/orion' },
    ],
  },
];
