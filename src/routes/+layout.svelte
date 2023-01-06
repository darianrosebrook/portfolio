<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/header.svelte';
	const title = $page.data.title
		? $page.data.title
		: 'Darian Rosebrook: Product Designer | Design Systems, Portland Oregon';
	const description = $page.data.description
		? $page.data.description
		: "Hey! I'm Darian Rosebrook 👋🏼 I am a product designer in the Portland, Oregon area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.";
</script>

<svelte:head>
	<title>{$page.data.title}</title>
	<meta name="description" content={description} />
	<meta property="og:url" content="https://darianrosebrook.com/" />
	<meta property="og:image" content="https://darianrosebrook.com/og?title={title}" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Darian Rosebrook" />
	<meta property="og:locale" content="en_US" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@darianrosebrook" />
	<meta name="twitter:creator" content="@darianrosebrook" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://darianrosebrook.com/og?title={title}" />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"mainEntityOfPage": {
				"@type": "WebPage",
				"@id": "https://darianrosebrook.com/"
			},
			"name": "Darian Rosebrook",
			"image": "https://darianrosebrook.com/darianrosebrook.jpg",
			"jobTitle": ["Product Designer", "Author", "Writer" ],
			"worksFor": {
				"@type": "Organization",
				"name": "Paths.design"
			}, 
			"url": "https://darianrosebrook.com/",
			"sameAs": [
				"https://twitter.com/darianrosebrook",
				"https://www.linkedin.com/in/darianrosebrook/",
				"https://www.github.com/darianrosebrook",
				"https://www.instagram.com/darianrosebrook/",
				"https://www.youtube.com/@darian.rosebrook",
				"https://read.compassofdesign.com/@darianrosebrook",
		]
		}
	</script>
</svelte:head>

<main>
	<Header />
	<slot />
</main>
