<script>
	import '../app.css';
	const title = 'Darian Rosebrook';
	const subtitle = 'Lead Product Designer';
</script>

<section class="hero">
	<div class="hero-body">
		<div class="hero-image">
			<img
				src="/darianrosebrook.jpg"
				alt="Darian Rosebrook, a product designer from the Portland, Oregon area. He specializes in design systems, design technology, and custom design tooling."
				/>
		</div>
		<div class="container">
			<p class="body-2 subtitle">
				{subtitle}
			</p>
			<h1 class="title-1">
				{title}
			</h1>

			    <p>Hey there! I'm Darian Rosebrook, a Lead Product Designer based in the Portland, Oregon area, specializing in design systems, design technology (UX engineering), and custom design tooling for Figma. My passion lies at the intersection of design operations and design systems, where I focus on fixing design collaboration and product development cycles by improving design processes and collaboration.</p>
            <p>As a designer and developer hybrid, I bridge the gap in the product development cycle, enhancing the experience for both design and engineering teams. I'm dedicated to creating custom tooling between GitHub and Figma to streamline workflows, crafting robust design systems that drive innovation, and fostering a collaborative environment that encourages growth.</p>
            <p>My expertise includes:</p>
            <ul>
                <li>Developing full-featured, high fidelity component libraries in tools like Figma</li>
                <li>Creating comprehensive guides and documentation on design system usage</li>
                <li>Enhancing the development experience by streamlining component library consumption</li>
                <li>Building custom Figma plugins that accelerate product design workflows, design system creation, and maintenance</li>
                <li>Implementing tooling that keeps design and development closely in sync</li>
                <li>Establishing processes and workflows that optimize feedback, contribution, and adoption across teams</li>
            </ul>
            <p>Throughout my career, I've had the privilege of working with industry giants like Microsoft, Salesforce, and Nike, contributing to groundbreaking products and design systems. I'm committed to continuously teaching and mentoring designers in the community, sharing my knowledge, and helping others reach their full potential.</p>
            <p>If you're passionate about design and want to discuss how we can collaborate to create innovative solutions, feel free to reach out! I'm always eager to connect with like-minded professionals and explore new opportunities in UX and Product Design.</p>
	<p>And if you need to see my work, <a
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
