const HEIGHT = 600;
const WIDTH = 1000;

/**
 *
 * @param {URLSearchParams} query
 */
export function parseQuery(query) {
	const message = query.get('message') ?? undefined;
	const title = query.get('title') ?? undefined;
	const width = query.get('w') ?? WIDTH;
	const height = query.get('h') ?? HEIGHT;
	return { message, width: +width, height: +height, title };
}
