import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  let clients: any[] = [];

  // SSE setup
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res,
    };

    clients.push(newClient);

    req.on("close", () => {
      clients = clients.filter((client) => client.id !== clientId);
    });
  });

  // Function to broadcast updates to all clients
  function broadcast(data: any) {
    clients.forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  // Simulate manufacturing updates
  const categories = ["SAFETY", "QUALITY", "COST", "DELIVERY", "PEOPLE"];
  const messages = [
    "New incident reported in Area 4",
    "Product defect rate increased to 2.5%",
    "Budget adherence alert: Material costs up 5%",
    "Shipment delayed for Client X",
    "New training module completed by Team B",
    "No-incident streak reached 15 days",
    "Production efficiency improved by 3%",
  ];

  setInterval(() => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const update = {
      category,
      message,
      timestamp: new Date().toISOString(),
      type: "update",
    };
    broadcast(update);
  }, 15000); // Send an update every 15 seconds

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
