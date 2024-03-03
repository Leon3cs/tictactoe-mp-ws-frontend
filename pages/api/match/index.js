import { matchRepository } from "../../../repos/match.js";
import { EntityId } from "redis-om";
import client from "../../../configs/redis.js";
import matchService from "../../../service/match.js";
import { HTTP_STATUS, HTTP_METHOD, handleMethod } from "../../../util/http.js";

export default function handler(req, res) {
    handleMethod(HTTP_METHOD.POST, req, async () => {
        const { players } = req.body

        const data = matchService.createMatch(players);

        let match = await matchRepository.save(data);
    
        const grid = matchService.initGrid();
    
        await client.json.set(match[EntityId], "$", grid);
    
        match.gridId = match[EntityId];
    
        match = await matchRepository.save(match);
    
        res.status(HTTP_STATUS.CREATED).json({ match, grid })
    })
}