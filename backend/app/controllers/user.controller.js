// import { blogDatamapper } from '../datamappers/index.js';
import sanitizeArray from "../utils/sanitizeArray.js";
import ErrorApi from "../utils/errors/api.error.js";
import { PrismaClient } from "@prisma/client";

//! Pour la protection des données, utilisation des sessions express
//! Pour protéger l'API, créer une table SQL pour les blogs et associer les utilisateurs aux blogs

const db = new PrismaClient();

export default {

  async getAll(req, res) {
    const users = await db.user.findMany({
      include: {
        role: true,
      },
    });
    res.status(200).json(users);
  },

  async update(req, res) {
    const { userId, role } = req.body;

    console.log("req.body", req.body);

    if (!role || role.trim().length === 0) {
      throw new Error("Veuillez entrer un contenu valide");
    }

    console.log("userId", userId);
    console.log("role", role);

    const roleData = await db.role.findUnique({
      where: { name: role },
    });

    console.log("roleData", roleData);

    if (!roleData) {
      return res.status(404).json({ error: "Role introuvable" });
    }

    const user = await db.user.update({
      where: { id: parseInt(userId) },
      data: { roleId: roleData.id },
    });

    console.log("user", user);

    res.status(200).json({
      message: "User mis à jour avec succès",
      user,
    });
  },
};
