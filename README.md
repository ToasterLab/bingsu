# Bingsu

<img src="./src/assets/img/Bingsu.png" width="200" />

Bingsu helps prevent linkrot by freezing (archiving) the hyperlinks in your documents.

## Development

```bash

npm run start

```

### Debugging the web pages

<kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>I</kbd> to open developer tools.
### WSL

If you're running Bingsu in WSL, you need an X server running on the Windows side. The following work well:

- [`VcXsrv`](https://github.com/ArcticaProject/vcxsrv)
- [MobaXterm](https://mobaxterm.mobatek.net/)

### Packaging

Building binaries is straighforward. On the appropriate platform, just run one of the following commands:

```bash
npm run build:windows
npm run build:debian
npm run build:macos
```
