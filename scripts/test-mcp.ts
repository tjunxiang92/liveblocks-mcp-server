// Test script: bun run scripts/test-mcp.ts
// Requires LIVEBLOCKS_SECRET_KEY in .env

const BASE_URL = process.env.MCP_URL || "http://localhost:3005/api/mcp";
const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json, text/event-stream",
};

function parseSSE(text: string): any {
  const match = text.match(/^data: (.+)$/m);
  return match ? JSON.parse(match[1]) : null;
}

async function testMcp() {
  console.log(`Testing MCP server at ${BASE_URL}\n`);

  // 1. Initialize
  console.log("--- Initialize ---");
  const initRes = await fetch(BASE_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    }),
  });
  console.log("Status:", initRes.status);
  const sessionId = initRes.headers.get("mcp-session-id");
  const initText = await initRes.text();
  const initBody = parseSSE(initText);
  console.log("Session ID:", sessionId);
  console.log("Server:", JSON.stringify(initBody?.result?.serverInfo));
  console.log("Capabilities:", JSON.stringify(initBody?.result?.capabilities), "\n");

  // 2. Send initialized notification
  await fetch(BASE_URL, {
    method: "POST",
    headers: { ...HEADERS, ...(sessionId ? { "mcp-session-id": sessionId } : {}) },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }),
  });

  // 3. List tools
  console.log("--- List Tools ---");
  const toolsRes = await fetch(BASE_URL, {
    method: "POST",
    headers: { ...HEADERS, ...(sessionId ? { "mcp-session-id": sessionId } : {}) },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    }),
  });
  console.log("Status:", toolsRes.status);
  const toolsText = await toolsRes.text();
  const toolsBody = parseSSE(toolsText);
  const toolNames = toolsBody?.result?.tools?.map((t: any) => t.name) || [];
  console.log("Tools:", toolNames.join(", "), "\n");

  // 4. Call get-rooms
  console.log("--- Call get-rooms ---");
  const callRes = await fetch(BASE_URL, {
    method: "POST",
    headers: { ...HEADERS, ...(sessionId ? { "mcp-session-id": sessionId } : {}) },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get-rooms",
        arguments: { limit: 3 },
      },
    }),
  });
  console.log("Status:", callRes.status);
  const callText = await callRes.text();
  const callBody = parseSSE(callText);
  console.log("Result:", JSON.stringify(callBody?.result || callBody?.error, null, 2)?.slice(0, 500));
}

testMcp().catch(console.error);
