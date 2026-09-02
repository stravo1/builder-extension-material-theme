import frappeUIPreset from "frappe-ui/tailwind";

export default {
	presets: [frappeUIPreset],
	// frappe-ui ships source, so Tailwind has to read its components too. Without
	// this line every frappe-ui control renders with no styles at all.
	content: ["./src/**/*.{vue,js}", "./node_modules/frappe-ui/src/**/*.{vue,js,ts}"],
};
