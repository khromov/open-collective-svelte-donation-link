<script lang="ts">
	import { encode } from 'uqr';
	import logo from '../assets/svelte-logo.svg';

	let { value }: { value: string } = $props();

	const QUIET = 2;
	/** Share of the code's width covered by the logo; ECC "H" tolerates it. */
	const LOGO = 0.22;

	const qr = $derived(encode(value, { ecc: 'H', border: 0 }));
	const size = $derived(qr.size + QUIET * 2);
	const path = $derived.by(() => {
		let d = '';
		qr.data.forEach((row, y) =>
			row.forEach((on, x) => {
				if (on) d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
			})
		);
		return d;
	});
	const box = $derived(size * LOGO);
	const offset = $derived((size - box) / 2);
</script>

<svg viewBox="0 0 {size} {size}" role="img" aria-label="QR code for {value}" shape-rendering="crispEdges">
	<rect width={size} height={size} fill="#fff" />
	<path d={path} fill="#141414" />
	<rect x={offset} y={offset} width={box} height={box} rx={box * 0.18} fill="#fff" shape-rendering="auto" />
	<image
		href={logo}
		x={offset + box * 0.14}
		y={offset + box * 0.14}
		width={box * 0.72}
		height={box * 0.72}
	/>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
