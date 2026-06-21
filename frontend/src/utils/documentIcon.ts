// Plain-language document names ("Identity Document", "Cadastral Plan"...)
// mapped to a representative emoji — same allow-list-by-keyword approach
// used to curate the document names themselves (see processService.ts),
// just for an icon instead of a label.
const DOCUMENT_ICONS: { match: RegExp; icon: string }[] = [
  { match: /identity/i, icon: '🪪' },
  { match: /ownership/i, icon: '📜' },
  { match: /contract/i, icon: '📝' },
  { match: /building|unit/i, icon: '🏢' },
  { match: /cadastral/i, icon: '🗺️' },
  { match: /agricultural|land/i, icon: '🌾' },
  { match: /construction|permit/i, icon: '🏗️' },
  { match: /business|registration/i, icon: '🏛️' },
  { match: /fee|payment|receipt/i, icon: '💳' },
  { match: /application/i, icon: '🧾' },
];

export function getDocumentIcon(documentName: string): string {
  return DOCUMENT_ICONS.find((entry) => entry.match.test(documentName))?.icon ?? '📄';
}
