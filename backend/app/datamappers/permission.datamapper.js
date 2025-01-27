import CoreDatamapper from "./core.datamapper.js";
import * as changeKeys from 'change-case/keys';

export default class Permission extends CoreDatamapper {
  tableName = 'permission';

  async searchPermission(params = {}) {

    const query = this.db
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.name`,
        `${this.tableName}.description`,
        `${this.tableName}.is_active`,
        `${this.tableName}.created_at`,
        `${this.tableName}.updated_at`,
        this.db.raw(`
          COALESCE(
            JSON_AGG(
              CASE 
                WHEN "role"."id" IS NOT NULL THEN JSON_BUILD_OBJECT(
                  'id', "role"."id",
                  'name', "role"."name",
                  'description', "role"."description",
                  'isActive', "role"."is_active",
                  'createdAt', "role"."created_at",
                  'updatedAt', "role"."updated_at"
                )
              END
            ) FILTER (WHERE "role"."id" IS NOT NULL), 
            '[]'
          ) AS "roles"
        `),
      )
      .from(this.tableName)
      .leftJoin('role_has_permission', 'role_has_permission.permission_id', '=', `${this.tableName}.id`)
      .leftJoin('role', 'role.id', '=', `role_has_permission.role_id`)
      .groupBy(
        `${this.tableName}.id`,
        `${this.tableName}.name`,
        `${this.tableName}.description`,
        `${this.tableName}.is_active`,
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