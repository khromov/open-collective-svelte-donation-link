export const COLLECTIVE = 'svelte';

export const AMOUNTS = [5, 10, 20, 50] as const;
export type Amount = (typeof AMOUNTS)[number];

export const DEFAULT_AMOUNT: Amount = 10;
export const INTERVALS = [
	{ id: 'oneTime', label: 'One time' },
	{ id: 'month', label: 'Monthly' },
	{ id: 'year', label: 'Yearly' }
] as const;
/** Values Open Collective accepts for its `interval` URL parameter. */
export type Interval = (typeof INTERVALS)[number]['id'];

export const DEFAULT_INTERVAL: Interval = 'oneTime';

/** Idle time before the screen snaps back to the defaults. */
export const RESET_AFTER_MS = 30_000;
/** The countdown only becomes visible for this final stretch. */
export const WARN_FOR_MS = 10_000;

/** https://documentation.opencollective.com — "Creating Custom Fundraising URLs" */
export function donationUrl(amount: number, interval: Interval): string {
	return `https://opencollective.com/${COLLECTIVE}/donate?interval=${interval}&amount=${amount}`;
}
