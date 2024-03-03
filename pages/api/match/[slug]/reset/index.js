import client from "../../../../../configs/redis";
import { matchRepository } from "../../../../../repos/match";
import matchService from "../../../../../service/match";
import {
  HTTP_METHOD,
  HTTP_STATUS,
  handleMethod,
} from "../../../../../util/http";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.PUT, req, async () => {
    const { slug } = req.query;

    if (slug) {
      let match = await matchRepository.fetch(slug);

      const matchReset = matchService.resetMatch(match);

      match.turn = matchReset.turn;
      match.round = matchReset.round;
      match.endgame = matchReset.endgame;
      match.circleWin = matchReset.circleWin;
      match.crossWin = matchReset.crossWin;
      match.draw = matchReset.draw;

      await matchRepository.save(match);

      const grid = matchService.initGrid();

      await client.json.set(slug, "$", grid);

      res.status(HTTP_STATUS.OK).json({ match, grid })
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send()
    }
  });
}
