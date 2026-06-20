import { prisma } from "./prisma.js";
import { scoreSimilarity } from "./similarity.js";

export async function getSimilarDossiers(id, limit = 5) {
  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: { caseHistory: true }
  });
  if (!dossier) return null;

  const candidates = await prisma.dossier.findMany({
    where: { id: { not: id }, caseHistory: { isNot: null } },
    include: { caseHistory: true }
  });

  return candidates
    .map((candidate) => ({ ...candidate, similarity: scoreSimilarity(dossier, candidate) }))
    .filter((candidate) => candidate.similarity.score > 0)
    .sort((a, b) => b.similarity.score - a.similarity.score)
    .slice(0, limit);
}
