# Bingsu

<img src="./src/assets/img/Bingsu.png" width="200" />

Bingsu helps you prevent linkrot in your documents.

## Development

```bash

npm run start:dev

```

### Debugging the web pages

<kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>I</kbd> to open developer tools.

### Debugging the main process

Electron is configured to listen for V8 inspector protocol messages on port `8080`. You can use the debugger built into Chrome. Visit `chrome://inspect`, click on the Connection tab, add a connection to `localhost:8080`, and look at the console logs.

### WSL

If you're running Bingsu in WSL, you need an X server running on the Windows side. The following work well:

- [`VcXsrv`](https://github.com/ArcticaProject/vcxsrv)
- [MobaXterm](https://mobaxterm.mobatek.net/)
