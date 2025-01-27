import AuthProvider from "../providers/auth.provider.js";
import { userDatamapper } from '../datamappers/index.js';

/**
 * MW qui va vérifier si l'utilisateur possède un token d'accès valide et non expiré
 * @param {Request} req - Requête venant de l'utilisateur
 * @param {Response} _ - Réponse inutilisée
 * @param {NextFunction} next - Fonction pour passer au prochain MW
 */
export default async function authMiddleware(req, _, next) {

  const { accessTokenM, refreshTokenM } = req.cookies;
  req.auth = null;

  if (!accessTokenM || !refreshTokenM)
    return next();

  const goodAccessToken = AuthProvider.verifyAccessToken(accessTokenM, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  if (!goodAccessToken)
    return next();

  const goodRefreshToken = AuthProvider.verifyRefreshToken(refreshTokenM, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  if (!goodRefreshToken)
    return next();

  const [ user ] = await userDatamapper.findByKey("id", goodAccessToken.sub);

  if (!user)
    return next();

  if (user.accessToken !== accessTokenM)
    return next();

  if (user.refreshToken !== refreshTokenM)
    return next();

  req.auth = {
    userId: goodAccessToken.sub,
  };

  return next();

}