import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { leaderboard } from "@db/schema";
import { desc, eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Submit a new score
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { nickname, score, isHardMode = false } = req.body;

      if (!nickname || typeof score !== 'number') {
        return res.status(400).json({ message: "Invalid input" });
      }

      // Check if user already has a score for this mode
      const existingScore = await db.query.leaderboard.findFirst({
        where: and(
          eq(leaderboard.nickname, nickname),
          eq(leaderboard.isHardMode, isHardMode)
        ),
        orderBy: [desc(leaderboard.score)]
      });

      // If there's an existing score
      if (existingScore) {
        // Only update if the new score is higher
        if (score > existingScore.score) {
          // Delete the old score
          await db.delete(leaderboard)
            .where(and(
              eq(leaderboard.nickname, nickname),
              eq(leaderboard.isHardMode, isHardMode)
            ));

          // Insert the new higher score
          const result = await db.insert(leaderboard)
            .values({ nickname, score, isHardMode })
            .returning();

          return res.json(result[0]);
        } else {
          return res.status(400).json({ 
            message: `Your current high score is ${existingScore.score}. Only higher scores can be submitted to the leaderboard!`
          });
        }
      }

      // If no existing score, insert the new score
      const result = await db.insert(leaderboard)
        .values({ nickname, score, isHardMode })
        .returning();

      res.json(result[0]);
    } catch (error) {
      console.error("Error submitting score:", error);
      res.status(500).json({ message: "Failed to submit score" });
    }
  });

  // Get top scores for a specific mode
  app.get("/api/leaderboard/:mode?", async (req, res) => {
    try {
      const isHardMode = req.params.mode === 'hard';

      const scores = await db.query.leaderboard.findMany({
        where: eq(leaderboard.isHardMode, isHardMode),
        orderBy: [desc(leaderboard.score)],
        limit: 10
      });

      res.json(scores);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}