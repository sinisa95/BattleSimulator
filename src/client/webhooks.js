const armies = [];

const webhook = (req, res, next) => {
  console.log(req.body);
  res.json();
  next();
};

module.exports = (server) => {
  server.post('/webhook', webhook);
};
