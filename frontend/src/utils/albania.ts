// The seeded backend dataset uses Kosovo place names. This maps them to
// Albanian municipalities for display only — the backend's stored data and
// API responses are untouched; this transforms rendered text client-side,
// the same way mapPhase/mapCaseStatus normalize other raw API values.
const KOSOVO_TO_ALBANIA_CITY: Record<string, string> = {
  'Fushë Kosovë': 'Kukës',
  Prishtinë: 'Tiranë',
  Prishtina: 'Tiranë',
  Mitrovicë: 'Elbasan',
  Mitrovica: 'Elbasan',
  Podujevë: 'Lezhë',
  Podujeva: 'Lezhë',
  Gjakovë: 'Fier',
  Gjakova: 'Fier',
  Prizren: 'Shkodër',
  Pejë: 'Vlorë',
  Peja: 'Vlorë',
  Gjilani: 'Berat',
  Gjilan: 'Berat',
  Ferizaj: 'Korçë',
  Obiliq: 'Dibër',
  Lipjan: 'Gjirokastër',
  Kosovë: 'Shqipëri',
  Kosovo: 'Shqipëri',
};

// Longest keys first, so e.g. "Gjilani" is matched before the shorter "Gjilan".
const REPLACEMENT_ENTRIES = Object.entries(KOSOVO_TO_ALBANIA_CITY).sort(([a], [b]) => b.length - a.length);

export function mapLocationToAlbania<T extends string | null | undefined>(location: T): T {
  if (!location) return location;
  return (KOSOVO_TO_ALBANIA_CITY[location] ?? location) as T;
}

export function localizeText(text: string): string {
  return REPLACEMENT_ENTRIES.reduce(
    (result, [kosovoTerm, albanianTerm]) => result.split(kosovoTerm).join(albanianTerm),
    text,
  );
}
