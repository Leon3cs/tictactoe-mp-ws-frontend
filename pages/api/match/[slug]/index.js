import { matchRepository } from "../../../../repos/match.js";
import client from "../../../../configs/redis.js";
import {
  HTTP_METHOD,
  HTTP_STATUS,
  handleMethod,
} from "../../../../util/http.js";

export default function handler(req, res) {
  handleMethod(HTTP_METHOD.DELETE, req, async () => {
    const { slug } = req.query;

    if (slug) {
      await matchRepository.remove(slug);

      await client.json.del(slug);

      res.status(HTTP_STATUS.OK).send("OK");
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).send();
    }
  });
}
