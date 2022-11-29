<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title}</title>
	<meta name="description" content={$page.data.description} />
</svelte:head>

<section>
	<h1>Well that ain&rsquo;t right...</h1>
	<p>
		<strong>{$page.status}</strong> &mdash; {$page.error.message}
	</p>
	<p>You should try again, or <a href="/">head back to the main page...</a></p>
</section>
