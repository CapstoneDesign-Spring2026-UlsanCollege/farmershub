# Backend Source Entry

The runtime entrypoint is in this folder:
- app.js
- server.js

During cleanup, core implementation modules remain in sibling folders under backend/ and are imported by these entry files. This keeps the app stable while providing the target runtime layout.
