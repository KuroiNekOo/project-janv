//! Explications
//* C'est une fonction flechée qui prend en argument le controller entier
//* Cette fonction flechée retourne une autre fonction flechée prenant (req, res, next)
//* Cette deuxième fonction flechée execute le controller parent avec (req, res, next)
//* (req, res, next) existent car ils seront utilisés dans le routeur Express qui fait du currying

//* Donc si le controller throw une erreur, ça remontera jusqu'ici pour catch et next(err)

export default (controller) => async (req, res, next) => {

  try {
    await controller(req, res, next);
  } catch (err) {
    next(err);
  }

};