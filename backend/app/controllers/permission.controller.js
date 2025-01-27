import { permissionDatamapper } from '../datamappers/index.js';
import sanitizeArray from '../utils/sanitizeArray.js';
import ErrorApi from '../utils/errors/api.error.js';

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

export default {

  create(req, res) {},

  async read(req, res) {

    // Si l'utilisateur ne met aucune contrainte, ça récupère tous les utilisateurs
    if (!Object.keys(req.query).length) {

      const permissions = sanitizeArray(
        await permissionDatamapper.findAll(),
      );

      return res.status(200).json({
        permissions,
        count: permissions.length,
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

    const permissions = sanitizeArray(
      await permissionDatamapper.searchPermission({
        where: {
          ['permission.id']: Number.parseInt(id) || null,
          ['permission.name']: name || null,
          ['permission.is_active']: isActive === 'true' ? true : isActive === 'false' ? false : null,
          ['permission.begin_date']: Date.parse(beginDate) ? (new Date(beginDate))?.toISOString() : null,
          ['permission.end_date']: Date.parse(endDate) ? (new Date(endDate))?.toISOString() : null,
        },
        limit,
        offset,
      }),
    );

    res.status(200).json({
      permissions,
      count: permissions.length,
    });

  },
  
  async readById(req, res) {

    const { id } = req.params;

    const permission = sanitizeArray(
      await permissionDatamapper.searchPermission({
        where: {
          ['permission.id']: Number.parseInt(id) || null,
        },
      }),
    );

    if (!permission.length)
      throw new ErrorApi('FAILED_GET_PERMISSION', 'La permission est introuvable.', { status: 404 });

    res.status(200).json({
      message: 'Permission trouvée.',
      permission,
      cout: permission.length,
    });

  },
  
  update(req, res) {},
  
  delete(req, res) {},

};
