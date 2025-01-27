import { userDatamapper } from '../datamappers/index.js';
import ErrorApi from '../utils/errors/api.error.js';
import crypto from 'node:crypto'; //! Temporairement encore en place pour les simulation du front sur le back
import AuthProvider from '../providers/auth.provider.js';

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

export default {

  async signup(req, res) {

    const { email } = req.body;

    // Si le body ne contient pas l'email
    if (!email)
      throw new ErrorApi('FAILED_SIGNUP1', 'Erreur lors de l\'inscription.', { status: 500 });

    const [ userFound = null ] = await userDatamapper.findByKey("email", email);

    if (userFound)
      throw new ErrorApi('FAILED_SIGNUP2', 'Erreur lors de l\'inscription.', { status: 500 });

    const salt = AuthProvider.generateSalt(16, 'hex');

    const user = await userDatamapper.create({
      email,
      salt,
    });

    if (!user)
      throw new ErrorApi('FAILED_SIGNUP3', 'Erreur lors de l\'inscription.', { status: 500 });

    // Generation du challenge avec une duree de 5 minutes
    const { challenge, signature } = AuthProvider.generateSignedChallenge();

    if (!challenge || !signature)
      throw new ErrorApi('FAILED_SIGNUP4', 'Erreur lors de l\'inscription.', { status: 500 });

    return res.status(200).json({
      salt,
      pow: {
        challenge,
        signature,
        difficulty: process.env.CHA_DIFF,
      },
    });

  },

  async signupValidate(req, res) {

    const body = req.body;

    if (!body.email || !body.hashPassword || !body.challenge || !body.proof || !body.signature)
      throw new ErrorApi('FAILED_SIGNUP5', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    const [ userFound = null ] = await userDatamapper.findByKey("email", body.email);

    // Si le compte possede un mot de passe, c'est qu'il est deja signup
    if (userFound?.password)
      throw new ErrorApi('FAILED_SIGNUP6', 'Erreur lors de l\'inscription.', { status: 500 });

    // Si l'utilisateur possède un salt, cela veut dire qu'il peut passer cette étape
    if (!userFound?.salt)
      throw new ErrorApi('FAILED_SIGNUP7', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    // Verification du challenge avec la signature
    const signedChallenge = AuthProvider.verifySignedChallenge(body.challenge, body.signature);

    if (!signedChallenge)
      throw new ErrorApi('FAILED_SIGNUP8', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    // Verification de la preuve de travail (proof)
    const proofVerify = AuthProvider.verifyProofOfChallenge(body.challenge, body.proof);

    if (!proofVerify)
      throw new ErrorApi('FAILED_SIGNUP9', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    const { accessToken, refreshToken } = AuthProvider.generateJWTTokens({
      sub: userFound.id,
      fingerprint: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.cookie('accessTokenM', `Bearer ${accessToken}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });
    res.cookie('refreshTokenM', refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });

    const userFoundAgain = await userDatamapper.update({
      id: userFound.id,
      password: body.hashPassword,
      accessToken,
      refreshToken,
    }) ?? null;

    if (!userFoundAgain)
      throw new ErrorApi('FAILED_SIGNUP10', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    res.status(200).json({
      accessToken,
      refreshToken,
    });

  },

  async verifyTokens (req, res) {

    if (!req.auth)
      return res.status(200).json({
        ok: false,
      });

    return res.status(200).json({
      ok: true,
    });

  },

  async signin(req, res) {

    const { email } = req.body;

    // Si le body ne contient pas l'email
    if (!email)
      throw new ErrorApi('FAILED_SIGNIN1', 'Erreur lors de la connexion.', { status: 500 });

    const [ userFound ] = await userDatamapper.findByKey("email", email);

    if (!userFound)
      throw new ErrorApi('FAILED_SIGNIN2', 'Erreur lors de la connexion.', { status: 500 });

    // Generation du challenge avec une duree de 5 minutes
    const { challenge, signature } = AuthProvider.generateSignedChallenge();

    if (!challenge || !signature)
      throw new ErrorApi('FAILED_SIGNIN3', 'Erreur lors de la connexion.', { status: 500 });

    return res.status(200).json({
      salt: userFound.salt,
      pow: {
        challenge,
        signature,
        difficulty: process.env.CHA_DIFF,
      },
    });

  },

  async signinValidate(req, res) {

    const body = req.body;

    if (!body.email || !body.hashPassword || !body.challenge || !body.proof || !body.signature)
      throw new ErrorApi('FAILED_SIGIN4', 'Erreur lors de la connexion.', { status: 500 });

    const [{ id, salt, password }] = await userDatamapper.findByKey("email", body.email);

    if (!salt)
      throw new ErrorApi('FAILED_SIGIN5', 'Erreur lors de la connexion.', { status: 500 });

    if (password !== body.hashPassword)
      throw new ErrorApi('FAILED_SIGIN6', 'Erreur lors de la connexion.', { status: 500 });

    // Verification du challenge avec la signature
    const signedChallenge = AuthProvider.verifySignedChallenge(body.challenge, body.signature);

    if (!signedChallenge)
      throw new ErrorApi('FAILED_SIGNIN7', 'Erreur lors de la connexion.', { status: 500 });

    // Verification de la preuve de travail (proof)
    const proofVerify = AuthProvider.verifyProofOfChallenge(body.challenge, body.proof);

    if (!proofVerify)
      throw new ErrorApi('FAILED_SIGNIN8', 'Erreur lors de la connexion.', { status: 500 });

    const { accessToken, refreshToken } = AuthProvider.generateJWTTokens({
      sub: id,
      fingerprint: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    const userFoundAgain = await userDatamapper.update({
      id,
      accessToken,
      refreshToken, 
    }) ?? null;

    if (!userFoundAgain)
      throw new ErrorApi('FAILED_SIGNIN9', 'Erreur lors de la validation de l\'inscription.', { status: 500 });

    res.cookie('accessTokenM', `Bearer ${accessToken}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });
    res.cookie('refreshTokenM', refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });

  },
  
  async logout(_, res) {

    res.clearCookie('accessTokenM');
    res.clearCookie('refreshTokenM');

    res.status(200).json({
      ok: true
    });

  },
  
  async generate(req, res) {

    if (!req.auth)
      throw new ErrorApi('BAD_TOKENS', 'Les tokens sont invalide.', { status: 500 });

    const { userId } = req.auth;
    const { accessToken, refreshToken } = AuthProvider.generateJWTTokens({
      sub: userId,
      fingerprint: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    const userFoundAgain = await userDatamapper.update({
      id: userId,
      accessToken,
      refreshToken, 
    }) ?? null;

    if (!userFoundAgain)
      throw new ErrorApi('FAILED_GENERATE', 'Erreur lors de la generation des tokens.', { status: 500 });

    res.cookie('accessTokenM', `Bearer ${accessToken}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });
    res.cookie('refreshTokenM', refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });

  },

  async changePassword(req, res) {

    const { email, hashOldPassword, hashNewPassword, hashConfirmNewPassword, newSalt, signature, challenge, proof } = req.body;

    const [ user ] = await userDatamapper.findByKey("email", email);

    if (!user)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    if (hashOldPassword !== user.password)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    if (hashNewPassword !== hashConfirmNewPassword)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    // Verification du challenge avec la signature
    const signedChallenge = AuthProvider.verifySignedChallenge(challenge, signature);

    if (!signedChallenge)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    // Verification de la preuve de travail (proof)
    const proofVerify = AuthProvider.verifyProofOfChallenge(challenge, proof);

    if (!proofVerify)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    const { accessToken, refreshToken } = AuthProvider.generateJWTTokens({
      sub: user.id,
      fingerprint: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    const newUser = await userDatamapper.update({
      id: user.id,
      password: hashNewPassword,
      salt: newSalt,
      accessToken,
      refreshToken, 
    }) ?? null;

    if (!newUser)
      throw new ErrorApi('FAILED_CHANGE_PASSWORD', 'Erreur lors de la validation du changement de mot de passe.', { status: 500 });

    res.cookie('accessTokenM', `Bearer ${accessToken}`, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });
    res.cookie('refreshTokenM', refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });

    res.status(200).json({
      accessToken,
      refreshToken,
    });  

  },

  async signupConfirmEmail(req, res) {},

};
