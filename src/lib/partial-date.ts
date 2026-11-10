/**
 * Compares YYYY or YYYY-MM strings on their shared precision, so '2019' and
 * '2019-08' count as equal instead of the year-only value sorting first.
 */
export function comparePartialDates(a: string, b: string): number {
	const length = Math.min(a.length, b.length);
	return a.slice(0, length).localeCompare(b.slice(0, length));
}

export function formatPartialDate(value: string): string {
	const [year, month] = value.split('-');
	return month ? `${month}/${year}` : year;
}

interface Period {
	start: string;
	end?: string;
}

// '9999' ranks running periods first.
const endSortKey = (period: Period) => period.end ?? '9999';

export function comparePeriodsDesc(a: Period, b: Period): number {
	return (
		comparePartialDates(endSortKey(b), endSortKey(a)) ||
		comparePartialDates(b.start, a.start)
	);
}
