# Bingsu

[![photo of bingsu by BennyNoon](./src/assets/img/bingsu-photo.jpg)](https://pixabay.com/photos/bingsu-menu-mango-3868700/)

Bingsu helps you prevent linkrot in your documents.

## Development

```bash

npm run start:dev

```

### Debugging the web pages

<kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>I</kbd> to open developer tools.

### Debugging the main process

Electron is configured to listen for V8 inspector protocol messages on port `8080`. You can use the debugger built into Chrome. Visit `chrome://inspect`, click on the Connection tab, add a connection to `localhost:8080`, and look at the console logs.
