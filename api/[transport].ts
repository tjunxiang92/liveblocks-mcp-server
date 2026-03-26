import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerTools } from "../src/server.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

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

const verifyToken = async (
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) return undefined;
  return {
    token: bearerToken,
    clientId: "mcp-client",
    scopes: [],
  };
};

const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
});

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
