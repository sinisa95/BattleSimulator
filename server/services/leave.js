
const leave = () => {

}

module.exports = (req, res, next) => {
    leave(req.body, req.query.accessToken)
        .then(result => {
            res.json(result);
            next();
        })
        .catch(err => {
            next(err);
        });
}