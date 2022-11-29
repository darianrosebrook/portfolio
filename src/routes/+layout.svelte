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
	<meta property="og:url" content="https://darianrosebrook.com/" />
	<!-- meta property og:image using title as query string -->
	<meta property="og:image" content="https://darianrosebrook.com/og?title={title}" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
</svelte:head>

<main>
	<Header />
	<slot />
</main>
