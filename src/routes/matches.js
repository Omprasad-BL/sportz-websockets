import {Router} from "express"
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import {matches} from "../db/schema.js";
import {getMatchStatus} from "../utils/match-status.js";
import {db} from "../db/db.js";
import {desc} from "drizzle-orm";
export const  matchRouter=Router()
matchRouter.get("/",async (req,res)=>{
    const MAX_LIMIT=100;
    const parsed = listMatchesQuerySchema.safeParse(req.query);
    if(!parsed.success){
       return  res.status(400).json({error:"invalid query ", details:parsed.error});

    }

    const limit=Math.min(parsed.data.limit??50,MAX_LIMIT)
    try {
        const data=await  db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
        res.json({data})
    }
    catch (error){
        res.status(500).json({error:"Failed to list Matches "})
    }
})




matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid payload",
            details: parsed.error.flatten(),
        });
    }

    const { startTime, endTime, homeScore, awayScore, ...rest } = parsed.data;

    try {
        const status = getMatchStatus(startTime, endTime);
               if (!status) {
                       return res.status(400).json({error: "Invalid payload",
                        details: { fieldErrors: { startTime: ["Invalid date range"] } },
                       });
                  }
        const [event] = await db.insert(matches)
            .values({
                ...rest,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status,
            })
            .returning();
       if(res.app.locals.broadcastMatchCreated){
           res.app.locals.broadcastMatchCreated(event);
       }


        res.status(201).json({ data: event });
    } catch (error) {
        res.status(500).json({
            error: "Failed to create match"
        });
    }
});

import { eq } from "drizzle-orm";

/**
 * PATCH /matches/:id/score
 * Updates match scores in the DB and broadcasts to all connected clients.
 */
matchRouter.patch("/:id/score", async (req, res) => {
    const { id } = req.params;
    const { homeScore, awayScore } = req.body;

    // 1. Sanitize the ID and Scores
    const matchId = Number(id);
    if (isNaN(matchId)) {
        return res.status(400).json({ error: "Invalid match ID" });
    }

    try {
        // 2. Update the Database
        const [updatedMatch] = await db
            .update(matches)
            .set({
                homeScore: Number(homeScore ?? 0),
                awayScore: Number(awayScore ?? 0)
            })
            .where(eq(matches.id, matchId))
            .returning();

        if (!updatedMatch) {
            return res.status(404).json({ error: "Match not found" });
        }

        // 3. Trigger WebSocket Broadcast
        // We explicitly add 'matchId' so the frontend App.jsx finds it
        if (res.app.locals.broadcastMatchCreated) {
            res.app.locals.broadcastMatchCreated({
                ...updatedMatch,
                matchId: updatedMatch.id // Mapping 'id' to 'matchId' for frontend compatibility
            });
        }

        // 4. Send success response back to seed script
        res.status(200).json({ data: updatedMatch });

    } catch (error) {
        console.error("❌ Score Update Error:", error);
        res.status(500).json({ error: "Failed to update score" });
    }
});