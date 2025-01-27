// import { blogDatamapper } from '../datamappers/index.js';
import sanitizeArray from "../utils/sanitizeArray.js";
import ErrorApi from "../utils/errors/api.error.js";
import { PrismaClient } from "@prisma/client";

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les blogs et associer les utilisateurs aux blogs

const db = new PrismaClient();

export default {

  checkFields(content) {
    if (!content || content.trim().length === 0) {
      throw new Error("Veuillez entrer un Nom pour le blog.");
    }
  },

  async getAll(req, res) {
    const blogs = await db.blog.findMany()
    res.status(200).json(blogs);
  },


  async getById(req, res) {
    const { id } = req.params;

    try {
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                message: "ID invalide ou inexistant",
            });
        }

        const blog = await db.blog.findUnique({
            where: { id: parseInt(id) }, 
        });

        if (!blog) {
            return res.status(404).json({
                message: "Blog introuvable",
            });
        }

        res.status(200).json({
            message: "Blog récupéré avec succès",
            blog,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Une erreur est survenue lors de la récupération",
        });
    }
  },


  async create(req, res) {
    console.log("le content", content);
    console.log("le type est", typeof(content))
    const { content } = req.body;

    this.checkFields(content);

    const blog = await db.blog.create({
      data:  {content} ,
    });
    console.log(2)
    res.status(201).json({
      message: "Blog créé avec succès",
      blog,
    });
  },

  async update(req, res) {
    const { id, content } = req.body;
    this.checkFields(content);

    const blog = await db.blog.update({ 
      where: { id: parseInt(id) },
      data: { content },
    });

    res.status(200).json({
      message: "Blog mis a jour avec succès",
      blog,
    });
  },


  async delete(req, res) {
    const { id } = req.params;
    const blog = await this.readById(id);

    if (!blog) {
        return res.status(404).json({
            message: "Blog introuvable",
        });
    }

    if (blog.content === "admin") {
        return res.status(403).json({
            message: "Vous ne pouvez pas supprimer ce blog",
        });
    }

    await db.blog.delete({
        where: { id: parseInt(id) },
    });

    res.status(200).json({
        message: "Blog supprimé avec succès",
        blog,
    });
  },
};
