// import { roleDatamapper } from '../datamappers/index.js';
import sanitizeArray from "../utils/sanitizeArray.js";
import ErrorApi from "../utils/errors/api.error.js";
import { PrismaClient } from "@prisma/client";

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

const db = new PrismaClient();

export default {

//  app.get('/roles', (req, res) => roleController.getAll(req, res));
  async getAll(req, res) {
    const roles = await db.role.findMany()
    res.status(200).json(roles);
  },


  //app.get('/roles/:id', (req, res) => roleController.getById(req, res));
  async getById(req, res) {
    const { id } = req.params;

    try {
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                message: "ID invalide ou inexistant",
            });
        }

        const role = await db.role.findUnique({
            where: { id: parseInt(id) }, 
        });

        if (!role) {
            return res.status(404).json({
                message: "Rôle introuvable",
            });
        }

        res.status(200).json({
            message: "Rôle récupéré avec succès",
            role,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Une erreur est survenue lors de la récupération",
        });
    }
  },


  async create(req, res) {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      throw new Error("Veuillez entrer un Nom pour le rôle.");
    }

    const role = await db.role.create({
      data: { name },
    });

    res.status(201).json({
      message: "Rôle créé avec succès",
      role,
    });
  },

  async update(req, res) {
    const { id, name } = req.body;

    if (!name || name.trim().length === 0) {
      throw new Error("Veuillez entrer un Nom pour le rôle.");
    }

    const role = await db.role.update({ 
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json({
      message: "Rôle mis a jour avec succès",
      role,
    });
  },


  async delete(req, res) {
    const { id } = req.params;
    const role = await this.readById(id);

    if (!role) {
        return res.status(404).json({
            message: "Rôle introuvable",
        });
    }

    if (role.name === "admin") {
        return res.status(403).json({
            message: "Vous ne pouvez pas supprimer ce rôle",
        });
    }

    await db.role.delete({
        where: { id: parseInt(id) },
    });

    res.status(200).json({
        message: "Rôle supprimé avec succès",
        role,
    });
  },
};
