import User from "./user.datamapper.js";
import Role from "./role.datamapper.js";
import Permission from "./permission.datamapper.js";
import { connexion } from "../db/connexion.js";

export const userDatamapper = User.getInstance(connexion);
export const roleDatamapper = Role.getInstance(connexion);
export const permissionDatamapper = Permission.getInstance(connexion);