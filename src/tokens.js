import builder from "frappe-builder-extension-sdk";
import { TOKEN_GROUP } from "./palette.js";

/** Builder names a token with a uuid, so a token this theme wrote before is found by its label. */
export const saveTokens = async (tokens) => {
	const saved = await builder.data.getList("Builder Token", {
		fields: ["name", "token_name"],
		filters: { group: TOKEN_GROUP },
		pageLength: 500,
	});
	const names = new Map(saved.map((token) => [token.token_name, token.name]));
	await Promise.all(
		tokens.map((token) =>
			names.has(token.token_name)
				? builder.data.update("Builder Token", names.get(token.token_name), token)
				: builder.data.insert("Builder Token", token),
		),
	);
};
