// backend/server.js
import { listen } from "./src/app";

const port = process.env.PORT || 4000;

listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});