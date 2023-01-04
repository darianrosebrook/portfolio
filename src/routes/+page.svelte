<script>
	import '../app.css';
	const title = 'Darian Rosebrook';
	const subtitle = 'Lead Product Designer';
</script>

<section class="hero">
	<div class="hero-body">
		<div class="hero-image">
			<img
				src=" https://community-production.nyc3.digitaloceanspaces.com/product/asdfaefwef/darian-thin.png"
				alt="hero "
			/>
		</div>
		<div class="container">
			<p class="body-2 subtitle">
				{subtitle}
			</p>
			<h1 class="title-1">
				{title}
			</h1>

			<p>
				Hey! I'm Darian Rosebrook. I am a product designer focused on design systems, design
				technology (ux engineering), and custom design tooling for Figma in the Portland, Oregon,
				area.
			</p>

			<p>I build things that make it easier for people to build things.</p>

			<p>
				I'm super passionate about design ops, using design to design the designers' design
				processes.
			</p>

			<p>
				As a designer and developer hybrid, I bridge a lot of the product development cycle, helping
				improve the experience for both design and engineering. I design better workflows for
				designers working on products, standardize product design decisions, and document our design
				patterns and best practices. Prioritizing someone to focus on these decisions frees time for
				product teams to focus on more in-depth problem-solving in their product.
			</p>

			<p>
				Because I'm well versed in both modern web development (React / Web Components / HTML / CSS
				/ Javascript) and product design (Design System Thinking, User Experience Design, User
				Interface Design), I utilize these skills to do things like:
			</p>

			<ul>
				<li>
					<p>Creating full-featured, high fidelity component libraries in tools like Figma</p>
				</li>
				<li><p>Creating guides and documentation on how to use the design system</p></li>
				<li><p>Improving the development experience around consuming a component library</p></li>
				<li>
					<p>
						Creating workflow specific tooling like custom Figma plugins that help speed up the
						product design workflow, the creation and maintenance of design systems, and more
					</p>
				</li>
				<li><p>Creating tooling that helps keep design and development closer in sync</p></li>
				<li>
					<p>
						Creating processes and workflows that improve our feedback, contribution, and adoption
						across teams
					</p>
				</li>
				<li><p>…and much more.</p></li>
			</ul>

			<p>
				I'm always happy to discuss the work I do, so if anything resonates, feel free to reach out!
				And if you need to see my work, <a
					target="_blank"
					rel="noopener noreferrer nofollow"
					href="https://darian.is/a-designer">check out my portfolio here</a
				>
			</p>

			<p>
				You can also find me here — <a
				class="social-link"
				href="https://twitter.com/darianrosebrook"
				target="_blank"
				rel="noreferrer"
				><i class="fa-brands fa-twitter" aria-label="Twitter logo"><span>Twitter</span></i></a
			><a
			class="social-link"
			href="https://instagram.com/darianrosebrook"
			target="_blank"
			rel="noreferrer"
			><i class="fa-brands fa-instagram" aria-label="Instagram logo"><span>Instagram</span></i></a
		><a
					href="https://linkedin.com/in/darianrosebrook"
					class="social-link"
					target="_blank"
					rel="noreferrer"
					><i class="fa-brands fa-linkedin" aria-label="Linkedin Logo"><span>Linkedin</span></i></a
				><a
				href="https://youtube.com/@darianrosebrook"
				class="social-link"
				target="_blank"
				rel="noreferrer"
				><i class="fa-brands fa-youtube" aria-label="YouTube Logo"><span>YouTube</span></i></a
			><a
			href="https://read.compassofdesign.com/@darianrosebrook"
			class="social-link"
			target="_blank"
			rel="noreferrer"
			><i class="fa-brands fa-medium" aria-label="Medium.com Logo"><span>Medium.com</span></i></a
		>
			</p>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.hero-body {
		display: grid;
		grid-gap: 3.75rem;
		margin: 0 auto;
	}
	.hero-body .subtitle {
		font-family: var(--font-primary);
		margin-bottom: 0;
	}
	.hero-image {
		height: 100%;
		position: relative;
		overflow: hidden;
		display: grid;
		place-items: center;
	}
	.hero-image img {
		width: 100%;
		object-fit: cover;
		object-position: center;
		border-radius: 1rem;
		aspect-ratio: 3/4;
	}
	@media (min-width: 1080px) {
		.hero-body {
			grid-template-columns: 1fr 1fr;
			align-items: center;
			justify-content: center;
		}
	}
</style>
