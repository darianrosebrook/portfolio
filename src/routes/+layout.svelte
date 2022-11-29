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
	<meta charset="utf-8" />
	<title>{$page.data.title}</title>
	<meta name="description" content={description} />
	<link rel="icon" href="%sveltekit.assets%/favicon.ico" />
	<meta name="viewport" content="width=device-width" />
	<script src="https://kit.fontawesome.com/cf8a647076.js" crossorigin="anonymous"></script>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
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
</svelte:head>

<main>
	<Header />
	<slot />
</main>
