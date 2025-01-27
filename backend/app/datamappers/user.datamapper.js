import CoreDatamapper from "./core.datamapper.js";
import * as changeKeys from 'change-case/keys';

export default class User extends CoreDatamapper {
  tableName = 'user';

  async searchUser(params = {}) {

    const rolePermissionsSubquery = this.db
    .select('role.id as role_id')
    .select(
      this.db.raw(`
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN "permission"."id" IS NOT NULL THEN JSON_BUILD_OBJECT(
                'id', "permission"."id",
                'name', "permission"."name"
              )
            END
          ) FILTER (WHERE "permission"."id" IS NOT NULL), 
          '[]'
        ) AS "permissions"
      `)
    )
    .from('role')
    .leftJoin('role_has_permission', 'role.id', 'role_has_permission.role_id')
    .leftJoin('permission', 'role_has_permission.permission_id', 'permission.id')
    .groupBy('role.id')
    .as('role_permissions');

    const query = this.db
    .select([
      `${this.tableName}.id`,
      `${this.tableName}.email`,
      `${this.tableName}.last_name`,
      `${this.tableName}.first_name`,
      `${this.tableName}.is_active`,
      `${this.tableName}.last_login`,
      `${this.tableName}.created_at`,
      `${this.tableName}.updated_at`,
      this.db.raw(`
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN "role"."id" IS NOT NULL THEN JSONB_BUILD_OBJECT(
                'id', "role"."id",
                'name', "role"."name",
                'permissions', "role_permissions"."permissions"
              )
            END
          ) FILTER (WHERE "role"."id" IS NOT NULL), 
          '[]'
        ) AS "roles"
      `),
    ])
    .from(this.tableName)
    .leftJoin('user_has_role', 'user.id', 'user_has_role.user_id')
    .leftJoin('role', 'user_has_role.role_id', 'role.id')
    .leftJoin(rolePermissionsSubquery, 'role.id', 'role_permissions.role_id')
    .groupBy(
      `${this.tableName}.id`,
      `${this.tableName}.email`,
      `${this.tableName}.last_name`,
      `${this.tableName}.first_name`,
      `${this.tableName}.is_active`,
      `${this.tableName}.last_login`,
      `${this.tableName}.created_at`,
      `${this.tableName}.updated_at`,
    );
  
    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (params.where)
      Object.entries(params.where).map(([key, value]) => {

        if (key === `${this.tableName}.end_date`)
          return value && query.where(`${this.tableName}.created_at`, '<=', value);

        if (key === `${this.tableName}.begin_date`)
          return value && query.where(`${this.tableName}.created_at`, '>=', value);

        if (typeof value === 'boolean')
          return query.where(key, '=', value);

        return value && (
          typeof value === 'string' ?
            query.whereRaw('LOWER(??) = LOWER(?)', [key, value]) :
            query.where(key, value)
        );

      });

    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (params.orWhere)
      Object.entries(params.orWhere).map(([key, value]) =>
        value && (
          typeof value === 'string' ?
            query.orWhereRaw('LOWER(??) = LOWER(?)', [key, value]) :
            query.orWhere(key, value)
        ),
      );

    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (params.andWhere)
      Object.entries(params.andWhere).map(([key, value]) =>
        value && (
          typeof value === 'string' ?
            query.andWhereRaw('LOWER(??) = LOWER(?)', [key, value]) :
            query.andWhere(key, value)
        ),
      );

    if (params.limit) query.limit(params.limit);

    if (params.offset) query.offset(params.offset);

    if (params.order) query.orderBy(
      params.order.column,
      params.order.direction,
    );

    const rows = await query;

    return rows.map((row) => changeKeys.camelCase(row));

  }

}