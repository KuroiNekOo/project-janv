import * as changeKeys from 'change-case/keys';

export default class CoreDatamapper {

  static instance;
  tableName;

  constructor(db) {

    //! Si une instance existe déjà, retourner directement cette instance
    if (this.instance)
      return this.instance;

    this.instance = this;
    this.db = db;

  }

  // Récupérer l'instance déjà existante en static
  static getInstance(db) {

    if (!this.instance)
      this.instance = new this(db);

    return this.instance;

  }

  async count() {

    const { count } = await this.db.from(this.tableName)
      .first()
      .count('* as count');

    return count;

  }

  async findByKey(key, value) {

    const row = await this.db.from(this.tableName)
      .where({ [key]: value })
      .first();

    const result = changeKeys.camelCase(row);

    return Array.isArray(result) ? result : [result];

  }

  async findAll(params) {

    const where = changeKeys.snakeCase(params?.where);
    const orWhere = changeKeys.snakeCase(params?.orWhere);
    const andWhere = changeKeys.snakeCase(params?.andWhere);

    const query = this.db.from(this.tableName);

    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (where)
      Object.entries(where).map(([key, value]) =>
        typeof value === 'string' ?
          query.whereRaw('LOWER(??) = LOWER(?)', [key, value]) :
          query.where(where),
      );

    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (orWhere)
      Object.entries(orWhere).map(([key, value]) =>
        typeof value === 'string' ?
          query.orWhereRaw('LOWER(??) = LOWER(?)', [key, value]) :
          query.orWhere(orWhere),
      );

    // Si la valeur est de type string, ça ne sera pas sensible à la casse
    if (andWhere)
      Object.entries(andWhere).map(([key, value]) =>
        typeof value === 'string' ?
          query.andWhereRaw('LOWER(??) = LOWER(?)', [key, value]) :
          query.andWhere(andWhere),
      );

    if (params?.limit) query.limit(params.limit);

    if (params?.offset) query.offset(params.offset);

    if (params?.order) query.orderBy(
      params.order.column,
      params.order.direction,
    );

    const rows = await query;

    return rows.map((row) => changeKeys.camelCase(row));

  }

  async create(input) {

    const newInput = changeKeys.snakeCase(input);

    //! Le stringify retirer les propriétés undefined
    const { rows: [row] } = await this.db.raw(`
      SELECT *
      FROM insert_${this.tableName}
      (?)
    `, [JSON.stringify(newInput)]);

    return changeKeys.camelCase(row);

  }

  async update(input) {

    const newInput = changeKeys.snakeCase(input);

    //! Le stringify retirer les propriétés undefined
    const { rows: [row] } = await this.db.raw(`
      SELECT *
      FROM update_${this.tableName}
      (?)
    `, [JSON.stringify(newInput)]);

    return changeKeys.camelCase(row);

  }

  async delete(params) {

    const where = changeKeys.snakeCase(params?.where);
    const orWhere = changeKeys.snakeCase(params?.orWhere);
    const andWhere = changeKeys.snakeCase(params?.andWhere);

    const query = this.db.from(this.tableName);

    if (where) query.where(where);

    if (orWhere) query.orWhere(orWhere);

    if (andWhere) query.andWhere(andWhere);

    const rows = await query.del().returning('*');

    return changeKeys.camelCase(rows);

  }

}