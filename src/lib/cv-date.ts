/**
 * Compares YYYY or YYYY-MM strings on their shared precision, so '2019' and
 * '2019-08' count as equal instead of the year-only value sorting first.
 */
export function compareCvDates(a: string, b: string): number {
	const length = Math.min(a.length, b.length);
	return a.slice(0, length).localeCompare(b.slice(0, length));
}
