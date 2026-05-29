const app = require("../inventario/server");

function getQuery(req) {
  if (req.query) return req.query;

  const url = new URL(req.url, "http://localhost");
  const query = {};

  for (const [key, value] of url.searchParams.entries()) {
    if (query[key] === undefined) {
      query[key] = value;
    } else if (Array.isArray(query[key])) {
      query[key].push(value);
    } else {
      query[key] = [query[key], value];
    }
  }

  req.query = query;
  return query;
}

function queryWithoutPath(query) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query || {})) {
    if (key === "path") continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== undefined) params.append(key, item);
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

module.exports = (req, res) => {
  const query = getQuery(req);

  if (query.path) {
    const pathValue = Array.isArray(query.path) ? query.path.join("/") : query.path;
    req.url = `/api/${pathValue}${queryWithoutPath(query)}`;
  }

  return app(req, res);
};
