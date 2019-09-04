
const attack = () => {

}

module.exports = (req, res, next) => {
    attack(req.body, req.query.accessToken)
        .then(result => {
            res.json(result);
            next();
        })
        .catch(err => {
            next(err);
        });
}