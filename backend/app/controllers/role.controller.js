// import { roleDatamapper } from '../datamappers/index.js';
import sanitizeArray from "../utils/sanitizeArray.js";
import ErrorApi from "../utils/errors/api.error.js";
import { PrismaClient } from "@prisma/client";

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les rôles et associer les utilisateurs aux rôles

const db = new PrismaClient();

export default {

  checkFields(datas) {
    if (!datas.name || datas.name.trim().length === 0) {
      throw new Error("Veuillez entrer un Nom pour le rôle.");
    }

    if (!datas.tag || datas.tag.trim().length === 0) {
      throw new Error(
        "Veuillez entrer un tag qui apparaitra pour les utilisateurs du rôle."
      );
    }

    if (datas.tag && datas.tag.trim().length > 15) {
      throw new Error("Le champ tag est trop long.");
    }

    if (datas.description && datas.description.trim().length > 50) {
      throw new Error("La description est trop longue.");
    }
  },

//  app.get('/roles', (req, res) => roleController.getAll(req, res));
  async getAll(req, res) {
    try {
        const roles = await prisma.role.findMany()
        res.status(200).json({});
    } catch (error) {
        res.status(500).json({
            message: error.message || "Une erreur est survenue",
        });
    }
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

      const role = await prisma.role.findUnique({
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
    try {
      const { tag, name, description } = req.params;
      const datas = { tag, name, description };
      this.checkFields(datas);

      const role = await prisma.role.create({ datas });
      res.status(201).json({
        message: "Rôle créé avec succès",
        role,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Une erreur est survenue",
      });
    }
  },

  async update(req, res) {
    try {
      const { tag, name, description } = req.params;
      const datas = { tag, name, description };
      this.checkFields(datas);

      const role = await prisma.role.update({ datas });

      res.status(201).json({
        message: "Rôle créé avec succès",
        role,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Une erreur est survenue",
      });
    }
  },

  async delete(req, res) {
    const { id } = req.params;

    try {
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

        await prisma.role.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({
            message: "Rôle supprimé avec succès",
            role,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Une erreur est survenue",
        });
    }
},
};
