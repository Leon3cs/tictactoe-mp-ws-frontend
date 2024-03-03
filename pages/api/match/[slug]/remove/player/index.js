import {
  HTTP_METHOD,
  HTTP_STATUS,
  handleMethod,
} from "../../../../../../util/http";
import client from "../../../../../../configs/redis";
import { matchRepository } from "../../../../../../repos/match";
import matchService from "../../../../../../service/match";
import { EntityId } from "redis-om";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.PUT, req, async () => {
    const { slug } = req.query;
    const { socketId } = req.body;

    if (!slug) {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }

    if (!socketId) {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }

    let match = await matchRepository.fetch(slug);

    if (match[EntityId]) {
      let players = match.players;

      const filteredPlayers = players.filter((player) => player != socketId);
      match.players = filteredPlayers;

      if (match.players.length) {
        match.first = filteredPlayers[0];
        match.round = filteredPlayers[0];

        const matchReset = matchService.resetMatch(match);

        match.turn = matchReset.turn;
        match.endgame = matchReset.endgame;
        match.circleWin = matchReset.circleWin;
        match.crossWin = matchReset.crossWin;
        match.draw = matchReset.draw;
        match.circleScore = matchReset.circleScore;
        match.crossScore = matchReset.crossScore;

        await matchRepository.save(match);

        const newGrid = matchService.initGrid();

        await client.json.set(slug, "$", newGrid);

        const grid = await client.json.get(slug);

        res.status(HTTP_STATUS.OK).json({ match, grid });
      } else {
        await matchRepository.remove(slug);

        await client.json.del(slug);

        res.status(HTTP_STATUS.OK).send();
      }
    }
  });
}
