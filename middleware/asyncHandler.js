<<<<<<< HEAD
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
=======
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
>>>>>>> 383f118593963a5e1911a521816c5e683ef6951f
};