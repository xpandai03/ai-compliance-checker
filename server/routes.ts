import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/openai/models", async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.json({ 
        models: [], 
        error: "OpenAI API key not configured" 
      });
    }

    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        return res.json({ 
          models: [], 
          error: `OpenAI API returned ${response.status}` 
        });
      }

      const data = await response.json();
      return res.json({ models: data.data || [] });
    } catch (error) {
      return res.json({ 
        models: [], 
        error: "Failed to fetch models from OpenAI" 
      });
    }
  });

  return httpServer;
}
