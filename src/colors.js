/**
 * Hex <-> HSV, ported from Builder's `src/utils/colors.ts` so the picker agrees
 * with it. Hue is degrees; saturation and value are fractions of one.
 */

export const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value ?? "");

export const hexToHsv = (color) => {
	if (!isHexColor(color)) return { hue: 0, saturation: 0, value: 0 };
	const [red, green, blue] = [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));

	const max = Math.max(red, green, blue);
	const delta = max - Math.min(red, green, blue);
	let hue = 0;
	if (delta !== 0) {
		if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
		else if (max === green) hue = (blue - red) / delta + 2;
		else hue = (red - green) / delta + 4;
		hue *= 60;
	}
	return { hue, saturation: max === 0 ? 0 : delta / max, value: max / 255 };
};

export const hsvToHex = (hue, saturation, value) => {
	const sector = Math.floor((hue / 360) * 6) % 6;
	const fraction = (hue / 360) * 6 - Math.floor((hue / 360) * 6);
	const p = value * (1 - saturation);
	const q = value * (1 - fraction * saturation);
	const t = value * (1 - (1 - fraction) * saturation);
	const channels = [[value, t, p], [q, value, p], [p, value, t], [p, q, value], [t, p, value], [value, p, q]][sector];
	return `#${channels.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
};
