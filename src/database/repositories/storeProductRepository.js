import { db } from '../schema/db'

export const storeProductRepository = {
  async getAll() {
    return db.storeProducts.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.storeProducts.get(id)
  },

  async create(product) {
    return db.storeProducts.add({ ...product, stock: Number(product.stock) || 0, createdAt: Date.now() })
  },

  async update(id, data) {
    return db.storeProducts.update(id, data)
  },

  async delete(id) {
    return db.storeProducts.delete(id)
  },

  async adjustStock(id, delta) {
    const product = await db.storeProducts.get(id)
    if (!product) return
    const newStock = (product.stock || 0) + delta
    return db.storeProducts.update(id, { stock: Math.max(0, newStock) })
  },
}
