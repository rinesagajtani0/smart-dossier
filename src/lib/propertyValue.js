import { prisma } from "./prisma.js";

function hashPropertyNumber(value) {
  let hash = 0;
  for (const char of value.toUpperCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function buildDrivers(dossier) {
  const drivers = ["urban zoning"];
  if (dossier?.propertyLocation) drivers.push(`municipality: ${dossier.propertyLocation}`);
  if (dossier?.propertyType === "commercial") drivers.push("commercial demand");
  if (dossier?.propertyType === "apartment") drivers.push("near school");
  if (dossier?.propertyLocation?.toLowerCase().includes("prishtina")) drivers.push("new road project");
  return [...new Set(drivers)].slice(0, 4);
}

export async function getPropertyValueEvolution(propertyNumber) {
  const dossier = await prisma.dossier.findFirst({
    where: { propertyNumber },
    orderBy: { updatedAt: "desc" }
  });

  const hash = hashPropertyNumber(propertyNumber);
  const today = 65000 + (hash % 90000);
  const oneYearAgo = Math.round(today * 0.88);
  const projectedAfterInfrastructure = Math.round(today * 1.15);

  return {
    propertyNumber,
    oneYearAgo,
    today,
    projectedAfterInfrastructure,
    drivers: buildDrivers(dossier)
  };
}
