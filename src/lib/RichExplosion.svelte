<script lang="ts">
	import rich from '../assets/rich.png';

	const COUNT = 44;

	type Particle = {
		el: HTMLImageElement;
		x: number;
		y: number;
		vx: number;
		vy: number;
		angle: number;
		spin: number;
		size: number;
		age: number;
	};

	let layer: HTMLDivElement;
	let particles: Particle[] = [];
	let frame = 0;
	let last = 0;

	const rand = (min: number, max: number) => min + Math.random() * (max - min);

	/** Fire a burst of Riches out of the point (x, y), in viewport pixels. */
	export function burst(x: number, y: number) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const vmin = Math.min(innerWidth, innerHeight);

		const ring = document.createElement('div');
		ring.className = 'ring';
		ring.style.left = `${x}px`;
		ring.style.top = `${y}px`;
		ring.addEventListener('animationend', () => ring.remove());
		layer.append(ring);

		for (let i = 0; i < COUNT; i++) {
			// Mostly upwards, so the faces fountain out and then rain down.
			const direction = rand(-Math.PI * 1.15, Math.PI * 0.15);
			const speed = vmin * rand(0.7, 2.1);
			const size = vmin * rand(0.07, 0.2);
			const el = document.createElement('img');
			el.src = rich;
			el.alt = '';
			el.className = 'face';
			el.style.width = `${size}px`;
			layer.append(el);
			particles.push({
				el,
				x,
				y,
				vx: Math.cos(direction) * speed,
				vy: Math.sin(direction) * speed,
				angle: rand(-40, 40),
				spin: rand(-420, 420),
				size,
				age: 0
			});
		}

		if (!frame) {
			last = performance.now();
			frame = requestAnimationFrame(tick);
		}
	}

	function tick(now: number) {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		const gravity = Math.min(innerWidth, innerHeight) * 2.6;

		particles = particles.filter((p) => {
			p.age += dt;
			p.vy += gravity * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.angle += p.spin * dt;

			const gone =
				p.y - p.size > innerHeight || p.x + p.size < 0 || p.x - p.size > innerWidth;
			if (gone) {
				p.el.remove();
				return false;
			}

			const pop = Math.min(1, 0.25 + p.age * 6);
			p.el.style.transform = `translate3d(${p.x - p.size / 2}px, ${p.y - p.size / 2}px, 0) rotate(${p.angle}deg) scale(${pop})`;
			return true;
		});

		frame = particles.length ? requestAnimationFrame(tick) : 0;
	}

	$effect(() => () => cancelAnimationFrame(frame));
</script>

<div class="layer" bind:this={layer} aria-hidden="true"></div>

<style>
	.layer {
		position: fixed;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 10;
	}

	.layer :global(.face) {
		position: absolute;
		left: 0;
		top: 0;
		height: auto;
		will-change: transform;
		filter: drop-shadow(0 0.3rem 0.5rem #0003);
	}

	.layer :global(.ring) {
		position: absolute;
		width: 6rem;
		height: 6rem;
		margin: -3rem 0 0 -3rem;
		border-radius: 50%;
		border: 0.6rem solid #ff3e00;
		animation: ring 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
	}

	@keyframes ring {
		from {
			transform: scale(0.2);
			opacity: 0.9;
		}
		to {
			transform: scale(9);
			opacity: 0;
		}
	}
</style>
