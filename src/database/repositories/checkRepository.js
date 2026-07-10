import { db } from '../schema/db'

export const checkRepository = {
  async getAll() {
    return db.checks.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.checks.get(id)
  },

  async create(check) {
    return db.checks.add({
      ...check,
      status: check.status || 'pending',
      createdAt: Date.now(),
    })
  },

  async update(id, data) {
    return db.checks.update(id, data)
  },

  async delete(id) {
    return db.checks.delete(id)
  },
}
