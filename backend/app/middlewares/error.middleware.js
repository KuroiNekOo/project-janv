export default (err, _, res, next) => {

  //! Passer la main au gestionnaire d'erreurs d'Express si les en-têtes ont déjà été envoyés au client
  if (res.headersSent) return next(err);

  // console.log('stack:', err.stack);

  // const { status, name } = err;

  return res.status(500).json({
    ...err,
    message: err.message,
  });

};