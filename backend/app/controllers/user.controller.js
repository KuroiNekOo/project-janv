import { userDatamapper } from '../datamappers/index.js';
import sanitizeArray from '../utils/sanitizeArray.js';
import ErrorApi from '../utils/errors/api.error.js';

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

export default {

  create(req, res) {},

  async read(req, res) {

    // Si l'utilisateur ne met aucune contrainte, ça récupère tous les utilisateurs
    if (!Object.keys(req.query).length) {

      const users = sanitizeArray(
        await userDatamapper.findAll(),
      );

      return res.status(200).json({
        users,
        count: users.length,
      });

    }

    const {
      id,
      email,
      lastName,
      firstName,
      isActive,
      beginDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const users = sanitizeArray(
      await userDatamapper.searchUser({
        where: {
          ['user.id']: Number.parseInt(id) || null,
          ['user.email']: email || null,
          ['user.last_name']: lastName || null,
          ['user.first_name']: firstName || null,
          ['user.is_active']: isActive === 'true' ? true : isActive === 'false' ? false : null,
          ['user.begin_date']: Date.parse(beginDate) ? (new Date(beginDate))?.toISOString() : null,
          ['user.end_date']: Date.parse(endDate) ? (new Date(endDate))?.toISOString() : null,
        },
        limit,
        offset,
      }),
    );

    res.status(200).json({
      users,
      count: users.length,
    });

  },
  
  async readById(req, res) {

    const { id } = req.params;

    const user = sanitizeArray(
      await userDatamapper.searchUser({
        where: {
          ['user.id']: Number.parseInt(id) || null,
        },
      }),
    );

    if (!user.length)
      throw new ErrorApi('FAILED_GET_USER', 'L\'utilisateur est introuvable.', { status: 404 });

    res.status(200).json({
      message: 'Utilisateur trouvé.',
      user,
      cout: user.length,
    });

  },
  
  update(req, res) {},
  
  delete(req, res) {},

};
