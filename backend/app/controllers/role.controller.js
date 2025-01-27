import { roleDatamapper } from '../datamappers/index.js';
import sanitizeArray from '../utils/sanitizeArray.js';
import ErrorApi from '../utils/errors/api.error.js';

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

export default {

  create(req, res) {},

  async read(req, res) {

    // Si l'utilisateur ne met aucune contrainte, ça récupère tous les utilisateurs
    if (!Object.keys(req.query).length) {

      const roles = sanitizeArray(
        await roleDatamapper.findAll(),
      );

      return res.status(200).json({
        roles,
        count: roles.length,
      });

    }

    const {
      id,
      name,
      isActive,
      beginDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const roles = sanitizeArray(
      await roleDatamapper.searchRole({
        where: {
          ['role.id']: Number.parseInt(id) || null,
          ['role.name']: name || null,
          ['role.is_active']: isActive === 'true' ? true : isActive === 'false' ? false : null,
          ['role.begin_date']: Date.parse(beginDate) ? (new Date(beginDate))?.toISOString() : null,
          ['role.end_date']: Date.parse(endDate) ? (new Date(endDate))?.toISOString() : null,
        },
        limit,
        offset,
      }),
    );

    res.status(200).json({
      roles,
      count: roles.length,
    });

  },
  
  async readById(req, res) {

    const { id } = req.params;

    const role = sanitizeArray(
      await roleDatamapper.searchRole({
        where: {
          ['role.id']: Number.parseInt(id) || null,
        },
      }),
    );

    if (!role.length)
      throw new ErrorApi('FAILED_GET_ROLE', 'Le role est introuvable.', { status: 404 });

    res.status(200).json({
      message: 'Role trouvé.',
      role,
      cout: role.length,
    });

  },
  
  update(req, res) {},
  
  delete(req, res) {},

};
