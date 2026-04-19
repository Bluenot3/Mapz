import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Strava proxy
  app.get("/api/strava/activities", async (req, res) => {
    try {
      // Use env variable or fallback placeholder for demo
      const accessToken = process.env.STRAVA_ACCESS_TOKEN || "87a5b86660500159394767de55684ce7e9ddb0bd"; 
      
      const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=5`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch from Strava" });
    }
  });

  // Geocoding Proxy to bypass CORS/rate limits on front end. We use Nominatim OpenStreetMap
  app.get("/api/geocode", async (req, res) => {
    const address = req.query.address as string;
    if (!address) return res.status(400).json({ error: "No address provided" });
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
         headers: { 'User-Agent': 'GenerativeTrailGraphicApp/1.0' }
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        res.json({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name });
      } else {
        res.status(404).json({ error: "Address not found" });
      }
    } catch (err) {
      console.error("Geocoding err", err);
      res.status(500).json({ error: "Failed to geocode" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
