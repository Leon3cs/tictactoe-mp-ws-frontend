import { matchRepository } from "../../../../../repos/match.js";
import {
  HTTP_METHOD,
  HTTP_STATUS,
  handleMethod,
} from "../../../../../util/http.js";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.GET, req, async () => {
    const { socketId } = req.query;

    if (!socketId) {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }

    let matchId = await matchRepository
      .search()
      .where("players")
      .contain(socketId)
      .firstId();

    if (matchId) {
      res.status(HTTP_STATUS.OK).json({ matchId });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }
  });
}
