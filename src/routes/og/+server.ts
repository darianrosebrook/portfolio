import Image from '../../lib/Dots.svelte';
import { parseQuery } from '$lib/parse';
import { componentToPng } from '$lib/renderImage';

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
	const query = url.searchParams;
	const { message, title, width, height } = parseQuery(query);
	return componentToPng(Image, { message, title, width, height, satori: true }, height, width);
};
