import { pool } from '../db/index.js'

export async function getProducts(req, res) {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id')
  res.json(rows)
}

export async function createProduct(req, res) {
  const { name, description, price, image_url } = req.body

  const query = `
    INSERT INTO products (name, description, price, image_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `

  const values = [name, description, price, image_url]

  const { rows } = await pool.query(query, values)
  res.status(201).json(rows[0])
}
