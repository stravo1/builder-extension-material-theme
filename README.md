# Material theme

Generate a Material 3 color system and write it to Builder as design tokens.

Open the extension from its details page or use the toolbar button. Choose a source color,
review the generated roles, and add the palette to the current Builder site.

## Capabilities

- `token.write` creates and updates the generated design tokens.
- `ui.popover` lets the toolbar button open the palette.

## Develop

```sh
npm install
npm run dev
```

The Vite config expects Builder at `http://builder.localhost:8080`.

## Build and package

```sh
npm run build
npm run package
```

The package command validates the repository and writes
`release/stravo1-material-theme-<version>.builderext`. For the next release, increase the
version in `manifest.json` and `package.json`, then push the new version as a tag, such as
`1.0.7`. Leave out the `v`: Builder Hub reads only a bare version tag.
