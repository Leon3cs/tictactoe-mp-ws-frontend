import {
  HTTP_STATUS,
  HTTP_METHOD,
  handleMethod,
} from "../../../../../../util/http";
import { matchRepository } from "../../../../../../repos/match";
import { EntityId } from "redis-om";
import client from "../../../../../../configs/redis";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.PUT, req, async () => {
    const { slug } = req.query;
    const { socketId } = req.body;

    if (!slug) {
      res.status(HTTP_STATUS.NOT_FOUND).send()
    }

    if (!socketId) {
      res.status(HTTP_STATUS.NOT_FOUND).send()
    }

    let match = await matchRepository.fetch(slug);

    if (match[EntityId]) {
      let players = [...match.players, socketId];

      match.players = players;

      match = await matchRepository.save(match);

      const grid = await client.json.get(slug);

      res.status(HTTP_STATUS.OK).json({ match, grid })
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send()
    }
  });
}
