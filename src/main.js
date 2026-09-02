import builder from "frappe-builder-extension-sdk";
import "./index.css";

import { vueAdapter } from "frappe-builder-extension-sdk/vue";

// how a component becomes DOM, named once. The SDK ships no framework
builder.use(vueAdapter);


/** The palette is one fixed-width column of color roles, so it asks for its own size. */
const POPOVER_SIZE = { width: 360, height: 591 };

builder.popover.register({ component: () => import("./popover/BrandPalette.vue") });

// what the Open button in this extension's details pane opens
builder.open.register({ kind: "popover", ...POPOVER_SIZE });

const open = () => builder.ui.openPopover({ title: "Material theme", ...POPOVER_SIZE });

// the button carries the function, and the SDK holds it under the button's name
builder.toolbar.register({
	name: "material-theme",
	region: "right",
	icon: "lucide-swatch-book",
	tooltip: "Generate a Material theme",
	action: open,
});
