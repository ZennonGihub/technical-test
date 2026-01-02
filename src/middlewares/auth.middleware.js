import boom from "@hapi/boom";
import config from "../../config.js";

export function checkApiKey(req, res, next) {
  const apiKey = req.headers["api-key"];

  if (config.apiKey === apiKey) next();
  else next(boom.unauthorized("Invalid API Key"));
}
