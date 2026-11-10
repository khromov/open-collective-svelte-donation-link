<script lang="ts">
	import {
		AMOUNTS,
		DEFAULT_AMOUNT,
		DEFAULT_RECURRING,
		RESET_AFTER_MS,
		WARN_FOR_MS,
		donationUrl,
		type Amount
	} from './lib/config';
	import QrCode from './lib/QrCode.svelte';
	import RichExplosion from './lib/RichExplosion.svelte';
	import logo from './assets/svelte-logo.svg';
	import rich from './assets/rich.png';

	let amount = $state<Amount>(DEFAULT_AMOUNT);
	let recurring = $state(DEFAULT_RECURRING);

	let lastTouch = $state(Date.now());
	let now = $state(Date.now());

	let explosion: RichExplosion;

	const url = $derived(donationUrl(amount, recurring));
	const dirty = $derived(amount !== DEFAULT_AMOUNT || recurring !== DEFAULT_RECURRING);
	const remaining = $derived(Math.max(0, RESET_AFTER_MS - (now - lastTouch)));
	const warning = $derived(dirty && remaining <= WARN_FOR_MS);

	function touch() {
		lastTouch = now = Date.now();
	}

	function reset() {
		amount = DEFAULT_AMOUNT;
		recurring = DEFAULT_RECURRING;
	}

	function setRecurring(next: boolean, event: MouseEvent) {
		if (next && !recurring) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			explosion.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
		}
		recurring = next;
	}

	// Idle clock: only runs while the screen differs from its defaults.
	$effect(() => {
		if (!dirty) return;
		const id = setInterval(() => {
			now = Date.now();
			if (now - lastTouch >= RESET_AFTER_MS) reset();
		}, 200);
		return () => clearInterval(id);
	});

	// Keep the tablet awake where the browser allows it.
	$effect(() => {
		const lock = () => {
			if (document.visibilityState === 'visible') {
				navigator.wakeLock?.request('screen').catch(() => {});
			}
		};
		lock();
		document.addEventListener('visibilitychange', lock);
		return () => document.removeEventListener('visibilitychange', lock);
	});
</script>

<svelte:window onpointerdown={touch} onkeydown={touch} />

<main class="screen">
	<header class="head">
		<div class="brand">
			<img src={logo} alt="" />
			<span>Svelte</span>
			<span class="on">on Open Collective</span>
		</div>
		<h1>Support Svelte</h1>
		<p>
			Svelte is free, open source, and funded by people like you. Pick an amount, scan the code
			with your phone, and finish there.
		</p>
	</header>

	<section class="amounts">
		<h2 id="amount-label">Amount <small>USD</small></h2>
		<div class="grid" role="radiogroup" aria-labelledby="amount-label">
			{#each AMOUNTS as option (option)}
				<button
					type="button"
					role="radio"
					class="raised amount"
					class:selected={amount === option}
					aria-checked={amount === option}
					onclick={() => (amount = option)}
				>
					<span class="currency">$</span>{option}
				</button>
			{/each}
		</div>
	</section>

	<section class="frequency">
		<h2 id="frequency-label">How often</h2>
		<div class="grid" role="radiogroup" aria-labelledby="frequency-label">
			<button
				type="button"
				role="radio"
				class="raised choice"
				class:selected={!recurring}
				aria-checked={!recurring}
				onclick={(event) => setRecurring(false, event)}
			>
				One time
			</button>
			<button
				type="button"
				role="radio"
				class="raised choice"
				class:selected={recurring}
				aria-checked={recurring}
				onclick={(event) => setRecurring(true, event)}
			>
				<img src={rich} alt="" />
				Monthly
			</button>
		</div>
	</section>

	<aside class="scan">
		<div class="card-wrap">
			<img class="peek" class:up={recurring} src={rich} alt="" />
			<div class="card">
				<div class="code">
					<QrCode value={url} />
				</div>
				<div class="details" aria-live="polite">
					<h2>Scan to donate</h2>
					<p class="summary">
						<strong>${amount}</strong>
						{recurring ? 'every month' : 'one time'}
					</p>
					<p class="where">opencollective.com/svelte</p>
				</div>
			</div>
		</div>
		<div class="slot">
			{#if warning}
				<div class="countdown" role="status">
					<span>Starting over in {Math.ceil(remaining / 1000)}s — tap anywhere to stay</span>
					<i style:width="{(remaining / WARN_FOR_MS) * 100}%"></i>
				</div>
			{/if}
		</div>
	</aside>
</main>

<RichExplosion bind:this={explosion} />

<style>
	.screen {
		height: 100%;
		padding: 2.4rem;
		padding: max(2.4rem, env(safe-area-inset-top)) max(2.4rem, env(safe-area-inset-right))
			max(2.4rem, env(safe-area-inset-bottom)) max(2.4rem, env(safe-area-inset-left));
		display: grid;
		gap: 1.8rem 2.8rem;
		/* Portrait: one column, QR takes whatever is left. */
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto auto auto minmax(0, 1fr);
		grid-template-areas: 'head' 'amounts' 'frequency' 'scan';
	}

	@media (orientation: landscape) {
		.screen {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr) auto;
			grid-template-areas:
				'head scan'
				'amounts scan'
				'frequency scan';
		}
	}

	/* ---------- header ---------- */

	.head {
		grid-area: head;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.3rem;
		font-weight: 600;
	}

	.brand img {
		height: 2.2rem;
		width: auto;
	}

	.brand .on {
		font-weight: 400;
		color: var(--fg-3);
	}

	h1 {
		margin: 0.8rem 0 0.4rem;
		font: 400 4.6rem / 1.05 var(--font-heading);
		letter-spacing: -0.01em;
	}

	@media (orientation: landscape) {
		h1 {
			font-size: 3.9rem;
			white-space: nowrap;
		}
	}

	.head p {
		margin: 0;
		max-width: 32em;
		font-size: 1.35rem;
		line-height: 1.4;
		color: var(--fg-3);
	}

	/* ---------- controls ---------- */

	section {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	section h2 {
		margin: 0 0 0.6rem;
		font: 600 1rem / 1 var(--font-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}

	section h2 small {
		font: inherit;
		font-weight: 400;
		opacity: 0.8;
	}

	.amounts {
		grid-area: amounts;
	}

	.frequency {
		grid-area: frequency;
	}

	.grid {
		flex: 1;
		display: grid;
		gap: 1rem;
		min-height: 0;
	}

	.amounts .grid {
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: minmax(7.5rem, 1fr);
	}

	.frequency .grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-auto-rows: 5.6rem;
	}

	@media (orientation: landscape) {
		.amounts .grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-auto-rows: minmax(0, 1fr);
		}
	}

	/* svelte.dev's bevelled "raised" button, made chunky. */
	.raised {
		--edge: var(--raised-highlight) var(--raised-shadow) var(--raised-shadow)
			var(--raised-highlight);
		--pressed: var(--raised-shadow) var(--raised-highlight) var(--raised-highlight)
			var(--raised-shadow);
		appearance: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		min-width: 0;
		margin: 0;
		padding: 0;
		border-style: solid;
		border-width: 0.15rem 0.45rem 0.45rem 0.15rem;
		border-color: var(--edge);
		border-radius: var(--radius);
		background: var(--bg-3);
		color: var(--fg-1);
		font-family: var(--font-ui);
		cursor: pointer;
		touch-action: manipulation;
		transition:
			background-color 0.12s,
			color 0.12s;
	}

	.raised:active,
	.raised.selected {
		border-width: 0.45rem 0.15rem 0.15rem 0.45rem;
		border-color: var(--pressed);
	}

	.raised.selected {
		--pressed: var(--primary-shadow) var(--primary-highlight) var(--primary-highlight)
			var(--primary-shadow);
		background: var(--bg-accent);
		color: #fff;
	}

	.raised:focus-visible {
		outline: 0.25rem solid var(--fg-accent);
		outline-offset: 0.25rem;
	}

	.amount {
		gap: 0;
		font: 400 4.4rem / 1 var(--font-heading);
	}

	.amount .currency {
		font-size: 0.55em;
		margin-right: 0.08em;
		transform: translateY(-0.28em);
		opacity: 0.75;
	}

	.choice {
		font-size: 1.9rem;
		font-weight: 600;
	}

	.choice img {
		height: 2.6rem;
		width: auto;
		transition: transform 0.3s cubic-bezier(0.3, 1.6, 0.5, 1);
	}

	.choice.selected img {
		transform: scale(1.25) rotate(-8deg);
	}

	/* ---------- QR card ---------- */

	.scan {
		grid-area: scan;
		container-type: size;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		--pad: 1.6rem;
		--peek: 3.2rem;
		--details: 8.4rem;
		/* Room kept free under the card for the idle countdown. */
		--slot: 4rem;
		--free: calc(100cqh - 2 * var(--pad) - var(--peek) - var(--slot));
	}

	.slot {
		height: var(--slot);
		display: flex;
		align-items: flex-end;
	}

	.card-wrap {
		position: relative;
		margin-top: var(--peek);
		/* Stacked card: QR on top, details below. */
		--code: min(100cqw - 2 * var(--pad), var(--free) - var(--details));
	}

	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		padding: var(--pad);
		border-radius: calc(var(--radius) * 1.6);
		/* Always light: a QR code wants a white quiet zone. */
		background: #fff;
		color: #141414;
		border: 0.15rem solid var(--border);
		filter: var(--shadow);
	}

	.code {
		width: var(--code);
		height: var(--code);
	}

	.details {
		text-align: center;
	}

	.details h2 {
		margin: 0;
		font: 400 2.4rem / 1.1 var(--font-heading);
	}

	.summary {
		margin: 0.5rem 0 0;
		font-size: 1.6rem;
		line-height: 1.2;
	}

	.summary strong {
		font-weight: 600;
		color: #d43008;
	}

	.where {
		margin: 0.5rem 0 0;
		font-size: 1.1rem;
		color: #666;
	}

	/* Wide slot (portrait tablets): QR left, details right. */
	@container (min-aspect-ratio: 5 / 4) {
		.card-wrap {
			--code: min(var(--free), 46cqw);
		}

		.card {
			flex-direction: row;
			align-items: center;
			gap: 2rem;
			padding-right: 2.6rem;
		}

		.details {
			text-align: left;
		}

		.details h2 {
			font-size: 3rem;
		}

		.summary {
			font-size: 2rem;
		}
	}

	/* Rich pops up from behind the card for recurring donations. */
	.peek {
		position: absolute;
		right: 1.6rem;
		top: 0;
		width: 6.4rem;
		height: auto;
		transform: translateY(10%) rotate(8deg);
		transition: transform 0.25s ease-in;
	}

	.peek.up {
		transform: translateY(-58%) rotate(8deg);
		transition: transform 0.5s 0.35s cubic-bezier(0.3, 1.7, 0.5, 1);
	}

	/* ---------- idle countdown ---------- */

	.countdown {
		position: relative;
		overflow: hidden;
		padding: 0.7rem 1.6rem 1rem;
		border-radius: 999px;
		background: var(--fg-1);
		color: var(--bg-1);
		font-size: 1.2rem;
		font-weight: 600;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.countdown i {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 0.35rem;
		background: var(--primary-highlight);
		transition: width 0.2s linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.peek,
		.choice img {
			transition: none;
		}
	}
</style>
