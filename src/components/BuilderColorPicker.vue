<template>
	<div class="color-picker-container flex w-full flex-col gap-2">
		<div
			ref="colorMap"
			class="relative m-auto h-24 w-full rounded-md"
			:style="colorMapStyle"
			@mousedown.prevent="startColorDrag">
			<div :class="selectorClass" :style="colorSelectorStyle" @mousedown.stop.prevent="startColorDrag"></div>
		</div>

		<div
			ref="hueMap"
			class="relative m-auto h-3 w-full rounded-md"
			:style="hueMapStyle"
			@mousedown.prevent="startHueDrag">
			<div :class="selectorClass" :style="hueSelectorStyle" @mousedown.stop.prevent="startHueDrag"></div>
		</div>

		<div class="flex flex-wrap items-center gap-1.5">
			<div
				v-for="swatch in swatches"
				:key="swatch"
				class="h-3.5 w-3.5 cursor-pointer rounded-full shadow-sm"
				:title="swatch"
				:style="{ background: swatch }"
				@click="selectColor(swatch)"></div>
			<button v-if="isSupported" type="button" aria-label="Pick a color from the screen" @click="open()">
				<span class="lucide-pipette h-3.5 w-3.5 text-ink-gray-7"></span>
			</button>
		</div>

		<TextInput
			:modelValue="modelValue"
			class="w-full [&_input]:font-mono"
			placeholder="#6750a4"
			maxlength="7"
			@update:modelValue="selectColor">
			<template #prefix>
				<div class="size-4 rounded shadow-md" :style="{ background: modelValue }"></div>
			</template>
		</TextInput>
	</div>
</template>

<script setup>
/**
 * Builder's color picker, ported from `Controls/ColorPickerContent.vue`. The
 * editor's own picker leans on Builder's stores for tokens and history, which an
 * extension frame cannot reach, so this keeps the markup and the pointer maths
 * and drops the rest.
 */
import { clamp, useElementBounding, useEyeDropper } from "@vueuse/core";
import { TextInput } from "frappe-ui";
import { computed, nextTick, ref, watch } from "vue";
import { hexToHsv, hsvToHex, isHexColor } from "../colors.js";
import { SEED_PRESETS } from "../palette.js";

const props = defineProps({ modelValue: { type: String, required: true } });
const emit = defineEmits(["update:modelValue"]);

const swatches = SEED_PRESETS;
const colorMap = ref(null);
const hueMap = ref(null);
const colorSelectorPosition = ref({ x: 0, y: 0 });
const hueSelectorPosition = ref({ x: 0, y: 0 });

const { isSupported, sRGBHex, open } = useEyeDropper();
const {
	width: colorMapWidth,
	height: colorMapHeight,
	left: colorMapLeft,
	top: colorMapTop,
	update: updateColorMapBounds,
} = useElementBounding(colorMap);
const { width: hueMapWidth, left: hueMapLeft, update: updateHueMapBounds } = useElementBounding(hueMap);

const hue = computed(() => ((hueSelectorPosition.value.x || 0) / (hueMapWidth.value || 1)) * 360);
const saturation = computed(() => colorSelectorPosition.value.x / (colorMapWidth.value || 1));
const value = computed(() => 1 - colorSelectorPosition.value.y / (colorMapHeight.value || 1));
const color = computed(() => hsvToHex(hue.value, saturation.value, value.value));

const colorMapStyle = computed(() => ({
	background: `linear-gradient(0deg, black, transparent), linear-gradient(90deg, white, transparent), hsl(${hue.value}, 100%, 50%)`,
}));
const hueMapStyle = {
	background:
		"linear-gradient(90deg, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",
};

const selectorClass =
	"absolute h-3 w-3 rounded-full border border-black border-opacity-20 before:absolute before:h-full before:w-full before:rounded-full before:border-2 before:border-white before:!bg-[currentColor] after:absolute after:left-[2px] after:top-[2px] after:h-[calc(100%-4px)] after:w-[calc(100%-4px)] after:rounded-full after:border after:border-black after:border-opacity-20 after:bg-transparent";

const colorSelectorStyle = computed(() => ({
	left: `calc(${colorSelectorPosition.value.x}px - 6px)`,
	top: `calc(${colorSelectorPosition.value.y}px - 6px)`,
	color: color.value,
	background: "transparent",
}));

const hueSelectorStyle = computed(() => ({
	left: `calc(${hueSelectorPosition.value.x}px - 6px)`,
	color: `hsl(${hue.value}, 100%, 50%)`,
	background: "transparent",
}));

/** The frame scrolls and the popover moves, so cached bounds go stale between drags. */
const syncMapBounds = () => {
	updateColorMapBounds();
	updateHueMapBounds();
};

const setSelectorPosition = (candidate) => {
	if (!isHexColor(candidate)) return;
	const hsv = hexToHsv(candidate);
	nextTick(() => {
		if (!colorMapWidth.value || !hueMapWidth.value) return;
		colorSelectorPosition.value = {
			x: hsv.saturation * colorMapWidth.value,
			y: (1 - hsv.value) * colorMapHeight.value,
		};
		hueSelectorPosition.value = { x: (hsv.hue / 360) * hueMapWidth.value, y: 0 };
	});
};

const selectColor = (candidate) => {
	const hex = candidate?.startsWith("#") ? candidate : `#${candidate}`;
	if (!isHexColor(hex)) return emit("update:modelValue", candidate);
	setSelectorPosition(hex);
	emit("update:modelValue", hex.toLowerCase());
};

const setColor = (event) => {
	colorSelectorPosition.value = {
		x: clamp(event.clientX - colorMapLeft.value, 0, colorMapWidth.value),
		y: clamp(event.clientY - colorMapTop.value, 0, colorMapHeight.value),
	};
	emit("update:modelValue", color.value);
};

const setHue = (event) => {
	hueSelectorPosition.value = { x: clamp(event.clientX - hueMapLeft.value, 0, hueMapWidth.value), y: 0 };
	emit("update:modelValue", color.value);
};

const makeDragHandler = (setter) => (event) => {
	syncMapBounds();
	setter(event);
	const onMove = (moved) => {
		moved.preventDefault();
		setter(moved);
	};
	document.addEventListener("mousemove", onMove);
	document.addEventListener("mouseup", () => document.removeEventListener("mousemove", onMove), { once: true });
};

const startColorDrag = makeDragHandler(setColor);
const startHueDrag = makeDragHandler(setHue);

watch(sRGBHex, (picked) => picked && selectColor(picked));
// the map has no width until it paints, so the first position lands on the resize
watch(colorMapWidth, (width) => width && setSelectorPosition(props.modelValue));
watch(
	() => props.modelValue,
	(next) => next !== color.value && setSelectorPosition(next),
	{ immediate: true },
);
</script>
