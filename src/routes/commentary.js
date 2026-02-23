import {Router} from "express";
import {createCommentarySchema} from "../validation/commentary.js";
import {matchIdParamSchema} from "../validation/matches.js";
import {commentary} from "../db/schema.js";
import {db} from "../db/db.js";

// export const commentaryRouter=Router();
export const commentaryRouter = Router({ mergeParams: true });
commentaryRouter.get("/",(req,res)=>{
    res.status(200).json({message:"Commentory LIST"});

})


commentaryRouter.post('/', async (req, res)=> {
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({error: 'Invalid match ID.', details: paramsResult.error.issues});
    }
    const bodyResult=createCommentarySchema.safeParse(req.body);
    if (!bodyResult.success) {
        return res.status(400).json({error: 'Invalid commentary payload.', details: bodyResult.error.issues});
    }
    try {
        const { minute, ...rest}=bodyResult.data;
        const [result]=await db.insert(commentary).values({
            matchId: paramsResult.data.id,
            minute,
            ...rest
        }).returning();

        if(res.app.locals.broadcastCommentary){
            res.app.locals.broadcastCommentary(result.matchId, result);
        }
        res.status(201).json({data: result});
    } catch (error) {
        console.error('Failed to create commentary:', error);
        res.status(500).json({error: 'Failed to create commentary.'});
    }
});
