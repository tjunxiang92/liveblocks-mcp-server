import { createMcpHandler } from "mcp-handler";
import { registerTools } from "../src/server.js";

const handler = createMcpHandler(
  (server) => {
    registerTools(server);
  },
  {
    serverInfo: {
      name: "liveblocks-mcp-server",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
  },
);

export { handler as GET, handler as POST, handler as DELETE };
