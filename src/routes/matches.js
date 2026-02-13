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
       return  res.status(400).json({error:"invalid query ", details:JSON.stringify(parsed.error)});

    }

    const limit=Math.min(parsed.data.limit??50,MAX_LIMIT)
    try {
        const data=await  db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
        res.json({data})
    }
    catch (error){
        res.status(500).json(({error:"Failed to list Matches "}))
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
        const [event] = await db.insert(matches)
            .values({
                ...rest,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                homeScore: homeScore ?? 0,
                awayScore: awayScore ?? 0,
                status: getMatchStatus(startTime, endTime),
            })
            .returning();

        res.status(201).json({ data: event });
    } catch (error) {
        console.error(error); // <-- VERY IMPORTANT
        res.status(500).json({
            error: "Failed to create match",
            details: error.message,
        });
    }
});
