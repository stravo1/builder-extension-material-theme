import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";

export const DEFAULT_SEED = "#6750a4";
export const SEED_PRESETS = ["#6750a4", "#006e1c", "#006a6a", "#005ac1", "#9c4235", "#8b418f"];
export const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

const label = (name) => name.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const tokenKey = (name) => `material-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

/** Material 3's semantic roles become Builder tokens with paired light/dark values. */
export const themeFor = (seed) => {
	const theme = themeFromSourceColor(argbFromHex(seed));
	const light = theme.schemes.light;
	const dark = theme.schemes.dark;
	const roles = [
		"primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
		"secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
		"tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
		"error", "onError", "errorContainer", "onErrorContainer",
		"background", "onBackground", "surface", "onSurface", "surfaceVariant", "onSurfaceVariant",
		"outline", "outlineVariant", "inverseSurface", "inverseOnSurface", "inversePrimary", "shadow", "scrim",
	];

	return {
		roles: roles.map((name) => ({ name, label: label(name), light: hexFromArgb(light[name]), dark: hexFromArgb(dark[name]) })),
		palettes: [
			["Primary", theme.palettes.primary], ["Secondary", theme.palettes.secondary], ["Tertiary", theme.palettes.tertiary],
			["Neutral", theme.palettes.neutral], ["Neutral variant", theme.palettes.neutralVariant],
		].map(([name, palette]) => ({ name, tones: TONES.map((tone) => ({ tone, color: hexFromArgb(palette.tone(tone)) })) })),
	};
};

export const tokensFor = ({ roles }) =>
	roles.map(({ name, label: token_name, light: value, dark: dark_value }) => ({
		key: tokenKey(name), token_name, type: "Color", value, dark_value, group: "Material theme",
	}));
