/**
 * Module d'authentification
 * @module authProvider
 */

import crypto from 'node:crypto';

/**
 * Auth provider -
 * Permet de fournir les méthodes liées à l'authentification.
 */
export default class AuthProvider {

  /**
   * Permet de vérifier un token JWT de manière globale sans le Bearer.
   * Vérification de la signature et de l'expiration.
   * @param {string} [token='']  Le token JWT à faire vérifier (par défaut chaîne de caractères vide)
   * @returns {Object} Le corps du JWT parsé en un objet JavaScript
   * @function
   * @name #verifyJWTToken
   * @memberof AuthProvider
   * @static
   * @private
   */
  static #verifyJWTToken(token = '') {

    // 1. Séparer le token JWT en 3 (tête, corps, signature)
    const [base64Header, base64Payload, signature] = token.split('.');
  
    // 2. Regénérer la signature pour le header et le payload
    const expectedSignature = this.generateHmacSHA256(`${base64Header}.${base64Payload}`, 'base64url');
  
    // 3. Comparer la signature regénérer avec l'originale
    if (expectedSignature !== signature)
      return false;
  
    // 4. Décoder le payload et le parser en un objet JavaScript
    const payloadString = Buffer.from(base64Payload, 'base64url').toString();
    const payload = JSON.parse(payloadString);
  
    // 5. Vérifier l'expiration du token JWT
    if (payload.expiration && Date.now() > payload.expiration)
      return false;
  
    // 6. Renvoyer le corps du token JWT parsé en un objet JavaScript
    return payload;
  
  }

  /**
   * Permet de créer un token JWT signé et encodé en base64url.
   * @param {string} [payload={}]  Le corps du token JWT en objet JavaScript (par défaut objet vide)
   * @returns {string} Le token JWT en chaîne de caractères (hadear.payload.signature)
   * @function
   * @name #createJWTToken
   * @memberof AuthProvider
   * @static
   * @private
   */
  static #createJWTToken(payload = {}) {

    // Étape 1: Créer le header
    const header = {
      alg: 'HS256', // Algorithme utilisé
      typ: 'JWT',   // Type de token
    };
    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  
    // Étape 2: Créer le payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
    // Étape 3: Générer une signature HMAC (header + payload)
    const signature = this.generateHmacSHA256(`${base64Header}.${base64Payload}`, 'base64url');
  
    // Étape 4: Assembler le token (header + payload + signature)
    return `${base64Header}.${base64Payload}.${signature}`;
  
  }

  /**
   * Permet de créer un challenge signé et encodé en hexadécimal.
   * La durée du challenge est définie dans les variables d'environnement.
   * @returns {Object} Un objet JavaScript contant le challenge et la signautre en chaîne de caractères.
   * @function
   * @name #createSignedChallenge
   * @memberof AuthProvider
   * @static
   * @private
   */
  static #createSignedChallenge() {

    // 1. Creation de la durée du challenge
    const timestamp = Date.now() + process.env.CHA_DURATION * 60 * 1000; // durée en millisecondes convertie en minutes
  
    // 2. Creation du salt pour le challenge
    const saltChallenge = this.generateSalt(16, 'hex');
  
    // 3. Creation du challenge
    const challenge = `${timestamp}:${saltChallenge}`;
  
    // 4. Creation de la signature pour le challenge
    const signature = this.generateHmacSHA256(challenge, 'hex');
  
    return { challenge, signature };
  
  }

  /**
   * Vérifier si deux objets sont les mêmes
   * Va vérifier si le fingerprint de la requete est le meme que celui du token
   * @param {Object} claims1 - Le fingerprint de la requete actuelle
   * @param {Object} claims2 - le finger print du token (access ou refresh)
   * @returns {boolean} Un objet JavaScript contant le challenge et la signautre en chaîne de caractères.
   * @function
   * @name #fingerprintTokenVerify
   * @memberof AuthProvider
   * @static
   * @private
   */
  static #fingerprintTokenVerify = (claims1, claims2) =>
    (JSON.stringify(claims1) === JSON.stringify(claims2));

  /**
   * Permet de générer un hash SHA-256 encodé d'une certaine manière.
   * @param {string} [message=''] Chaîne de caractères principale pour la génération du hash (par défaut chaîne de caractères vide)
   * @param {string} [salt=''] Chaîne de caractères secondaire pour la complexité du hash (par défaut chaîne de caractères vide)
   * @param {string} [encoding='hex'] L'encodage utilisé pour le hash (par défaut en héxadicimal)
   * @returns {string} Le hash encodé en chaîne de caractères
   * @function
   * @name generateHashSHA256
   * @memberof AuthProvider
   * @static
   */
  static generateHashSHA256(message = '', salt = '', encoding = 'hex') {
    return crypto.createHash('sha256').update(message + salt).digest(encoding);
  }

  /**
   * Permet de générer un hash SHA-256 signé et encodé d'une certaine manière.
   * @param {string} [message=''] Chaîne de caractères pour la génération du hash (par défaut chaîne de caractères vide)
   * @param {string} [encoding='hex'] L'encodage utilisé pour le hash (par défaut en héxadicimal)
   * @returns {string} Le hash encodé en chaîne de caractères
   * @function
   * @name generateHmacSHA256
   * @memberof AuthProvider
   * @static
   */ 
  static generateHmacSHA256(message = '', encoding = 'hex') {
    return crypto.createHmac('sha256', process.env.CHA_SECRET_KEY).update(message).digest(encoding);
  }

  /**
   * Permet de générer un salt avec un nombre d'octet(s) et encodé d'une certaine manière.
   * @param {string} [size=16] Taille en octet du salt généré
   * @param {string} [encoding='hex'] L'encodage utilisé pour le salt (par défaut en héxadicimal)
   * @returns {string} Le salt encodé en chaîne de caractères
   * @function
   * @name generateSalt
   * @memberof AuthProvider
   * @static
   */ 
  static generateSalt(size = 16, encoding = 'hex') {
    return crypto.randomBytes(size).toString(encoding);
  }

  /**
   * Permet de générer deux tokens JWT signé et encodé en base64url à partir d'un claim.
   * L'un des token est l'accesseur et l'autre le rafraîchisseur.
   * Un claim est une paire clé/valeur contenant des informations sur l'utilisateur ou le contexte d'authentification.
   * @param {string} [claims={}] Objet JavaScript possédant un ou plusieurs claim(s) (par défaut objet vide)
   * @returns {string} Le token accesseur et rafraîchisseur
   * @function
   * @name generateJWTTokens
   * @memberof AuthProvider
   * @static
   */ 
  static generateJWTTokens(claims = {}) {

    // 1. Créer un token accesseur
    const accessToken = this.#createJWTToken({
      ...claims,
      type: 'access',
      expiration: Date.now() + 15 * 60 * 1000, // 15 minutes en millisecondes
    });
  
    // 2. Créer un token rafraîchisseur
    const refreshToken = this.#createJWTToken({
      ...claims,
      type: 'refresh',
      expiration: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours en millisecondes
    });
  
    // 3. Renvoyer un objet JavaScript possédant les 2 tokens
    return { accessToken, refreshToken };
  
  }

  /**
   * Permet de vérifier la signature, l'expiration et préfix Bearer du token accesseur.
   * @param {string} [token=''] Token accesseur en chaîne de caractères (par défaut chaîne de caractères vide)
   * @returns {boolean} True ou False en fonction de la vérification
   * @function
   * @name verifyAccessToken
   * @memberof AuthProvider
   * @static
   */ 
  static verifyAccessToken(token = '', fingerprint = {}) {

    const [status, newToken] = token.split(' ');
  
    if (status !== 'Bearer')
      return false;
  
    const accessToken = this.#verifyJWTToken(newToken);

    if (!accessToken) return false;

    const fingerprintVerify = this.#fingerprintTokenVerify(fingerprint, accessToken.fingerprint)

    if (!fingerprintVerify) return false;

    return true;
  
  }

  /**
   * Permet de vérifier la signature et l'expiration du token rafraîchisseur.
   * @param {string} [token=''] Token rafraîchisseur en chaîne de caractères (par défaut chaîne de caractères vide)
   * @returns {boolean} True ou False en fonction de la vérification
   * @function
   * @name verifyRefreshToken
   * @memberof AuthProvider
   * @static
   */
  static verifyRefreshToken(token = '', fingerprint = {}) {

    const refreshToken = this.#verifyJWTToken(token);

    if (!refreshToken) return false;

    const fingerprintVerify = this.#fingerprintTokenVerify(fingerprint, refreshToken.fingerprint)

    if (!fingerprintVerify) return false;

    return true;

  }

  /**
   * Permet de générer un challenge signé et encodé en hexadécimal.
   * La durée du challenge est définie dans les variables d'environnement.
   * @returns {Object} Un objet JavaScript contant le challenge et la signautre en chaîne de caractères.
   * @function
   * @name generateSignedChallenge
   * @memberof AuthProvider
   * @static
   */
  static generateSignedChallenge() {
  
    return this.#createSignedChallenge();
  
  }

  /**
   * Permet de vérifier la preuvre de travail d'un challenge signé.
   * La preuve de travail est un Proof Of Work (PoW).
   * @param {string} [challenge=''] Challenge à vérifier (par défault chaîne de caractères vide)
   * @param {number} [proof=0] Preuve de travail (par défaut à 0)
   * @returns {boolean} True ou False en fonction de la vérification.
   * @function
   * @name verifyProofOfChallenge
   * @memberof AuthProvider
   * @static
   */
  static verifyProofOfChallenge(challenge = '', proof = 0) {

    // 1. Separation du challenge
    const [timestamp, _] = challenge.split(':');
  
    // 2. Vérifier que le timestamp n'est pas expiré
    if (Date.now() > parseInt(timestamp))
        return false;
  
    // 3. Générer le challenge avec la preuve de travail
    const prefix = '0'.repeat(process.env.CHA_DIFF);
    const hash = this.generateHashSHA256(challenge, proof, 'hex');
  
    // 4. Vérifier que le proof est correct
    if (!hash.startsWith(prefix))
        return false;
  
    return true;
  
  }

  /**
   * Permet de vérifier la signature d'un challenge signé.
   * @param {string} [challenge=''] Challenge à vérifier (par défault chaîne de caractères vide)
   * @param {number} [signature=''] Signature du challenge (par défault chaîne de caractères vide)
   * @returns {boolean} True ou False en fonction de la vérification.
   * @function
   * @name verifySignedChallenge
   * @memberof AuthProvider
   * @static
   */
  static verifySignedChallenge(challenge = '', signature = '') {

    // 1. Regénérer la signature attendue
    const expectedSignature = this.generateHmacSHA256(challenge, 'hex');
  
    // 2. Vérifier la correspondance entre la signature originale et la copie
    if (signature !== expectedSignature)
      return false;
  
    return true;
  
  }

}
