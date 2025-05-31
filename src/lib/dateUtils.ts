export function isWithinLast24Hours(date: Date): boolean {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Date(date) >= twentyFourHoursAgo;
}

export function shouldArchiveMarker(marker: { createdAt: Date, category: string }): boolean {
  if (marker.category !== 'ice') {
    return false;
  }
  return !isWithinLast24Hours(marker.createdAt);
}