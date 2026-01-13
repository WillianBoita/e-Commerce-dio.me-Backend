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

export async function editProduct(req, res){
  const { name, description, price, image_url } = req.body
  const { id } = req.params

  const query = `
    UPDATE products
    SET
    name = $1,
    description = $2,
    price = $3,
    image_url = $4
    WHERE id = $5
    RETURNING *;
  `

  const values = [name, description, price, image_url, id]

  const { rows } = await pool.query(query, values)
  res.status(201).json(rows[0])
}

export async function deleteProduct(req, res) {
  const { id } = req.params
  
  if (!id) {
    return res.status(400).json({ error: 'ID é obrigatório' })
  }

  const query = `
    DELETE FROM products
    WHERE id = $1
    RETURNING *;
  `

  const values = [id]

  const { rows } = await pool.query(query, values)
  res.status(200).json(rows[0])
}
