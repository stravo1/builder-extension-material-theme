<template>
	<div class="flex h-full min-h-0 flex-col bg-surface">
		<Tabs v-model="activeTab" :tabs="tabs">
			<template #tab-panel="{ tab }">
				<section v-if="tab.label === 'Source'" class="flex flex-col gap-4 p-4">
					<BuilderColorPicker v-model="seed" />
					<p v-if="error" class="-mt-2 text-p-sm text-ink-red-5">{{ error }}</p>
					<Button
						variant="solid"
						label="Generate Material tokens"
						:loading="writing"
						:disabled="Boolean(error)"
						@click="write" />
					<div class="flex flex-col gap-3">
						<div v-for="palette in theme.palettes" :key="palette.name">
							<p class="mb-1 text-p-xs text-ink-gray-6">{{ palette.name }}</p>
							<div class="flex h-6 overflow-hidden rounded">
								<span v-for="tone in palette.tones" :key="tone.tone" class="flex-1" :title="`${tone.tone} · ${tone.color}`" :style="{ backgroundColor: tone.color }" />
							</div>
						</div>
					</div>
				</section>

				<section v-else class="flex flex-col gap-4 p-4">
					<div class="flex items-center justify-between">
						<p class="text-p-sm font-medium text-ink-gray-8">Theme roles</p>
						<Switch v-model="showDark" size="sm" :label="showDark ? 'Dark' : 'Light'" />
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div v-for="role in theme.roles" :key="role.name" class="overflow-hidden rounded-md border border-outline-gray-2">
							<div class="h-9" :style="{ backgroundColor: valueOf(role) }" />
							<div class="truncate px-2 py-1.5 text-p-xs text-ink-gray-7" :title="`${role.label} · ${valueOf(role)}`">
								{{ role.label }}
							</div>
						</div>
					</div>
				</section>
			</template>
		</Tabs>
	</div>
</template>

<script setup>
/**
 * This is deliberately a small Material Theme Builder: the palette math stays in
 * Material Color Utilities while the popover makes its roles tangible before it
 * writes them into Builder.
 */
import builder from "frappe-builder-extension-sdk";
import { Button, Switch, Tabs } from "frappe-ui";
import { computed, ref, watch } from "vue";
import BuilderColorPicker from "../components/BuilderColorPicker.vue";
import { isHexColor } from "../colors.js";
import { DEFAULT_SEED, themeFor, tokensFor } from "../palette.js";

const seed = ref(DEFAULT_SEED);
const showDark = ref(false);
const writing = ref(false);
const tabs = [
	{ label: "Source", icon: "lucide-pipette" },
	{ label: "Roles", icon: "lucide-swatch-book" },
];
const activeTab = ref(0);

/** The last seed that parsed, so a half-typed hex leaves the strip standing. */
const applied = ref(DEFAULT_SEED);

const error = computed(() => (isHexColor(seed.value) ? "" : "Six hex digits, as in #6366f1"));
const theme = computed(() => themeFor(applied.value));
const valueOf = (role) => (showDark.value ? role.dark : role.light);

watch(seed, (value) => {
	if (isHexColor(value)) applied.value = value.toLowerCase();
});

const write = async () => {
	writing.value = true;
	try {
		await builder.tokens.set(tokensFor(theme.value));
		await builder.ui.toast(`Material theme written from ${applied.value}`, { type: "success" });
	} finally {
		writing.value = false;
	}
};
</script>
