# Material theme

Generate a Material 3 color system and write it to Builder as design tokens.

Open the extension from its details page or use the toolbar button. Choose a source color,
review the generated roles, and add the palette to the current Builder site.

## Capabilities

- `token.write` creates and updates the generated design tokens.
- `ui.popover` lets the toolbar button open the palette.

## Develop

```sh
yarn install
yarn dev
```

The Vite config expects Builder at `http://builder.localhost:8080`.

## Build and package

```sh
yarn build
yarn package
```

The package command validates the repository and writes
`release/builder-material-theme-1.0.0.builderext`. Push a tag matching the manifest version
exactly to let the release workflow publish that package.
