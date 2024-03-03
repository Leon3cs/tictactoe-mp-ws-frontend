import {
  HTTP_METHOD,
  HTTP_STATUS,
  handleMethod,
} from "../../../../../../util/http";
import { matchRepository } from "../../../../../../repos/match";
import { EntityId } from "redis-om";
import client from "../../../../../../configs/redis";
import matchService from "../../../../../../service/match";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.PATCH, req, async () => {
    const { slug } = req.query;
    const { row, col, playerId } = req.body;

    if (!slug) {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }

    let match = await matchRepository.fetch(slug);

    if (match[EntityId]) {
      let grid = await client.json.get(slug);

      if (matchService.checkPosition(row, col, grid)) {
        grid = matchService.circleMove(row, col, grid);

        await client.json.set(slug, "$", grid);

        match.turn = !match.turn;

        const [newRound] = match.players.filter((item) => item !== playerId);

        match.round = newRound;

        const gameDetails = matchService.checkForWinners(grid);
        match.endgame = gameDetails.endgame;
        match.circleWin = gameDetails.circleWin;
        match.crossWin = gameDetails.crossWin;
        match.draw = gameDetails.draw;

        let crossScore = match.crossScore;
        let circleScore = match.circleScore;

        if (gameDetails.crossWin) {
          crossScore = crossScore + 1;
        }

        if (gameDetails.circleWin) {
          circleScore = circleScore + 1;
        }

        match.crossScore = crossScore;
        match.circleScore = circleScore;

        match = await matchRepository.save(match);
      }

      res.status(HTTP_STATUS.OK).json({ match, grid });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }
  });
}
