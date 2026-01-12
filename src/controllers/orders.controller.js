import { pool } from '../db/index.js'

export async function createOrder(req, res) {
  const { items } = req.body

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    let total = 0

    for (const item of items) {
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      )

      if (productResult.rowCount === 0) {
        throw new Error('Produto não encontrado')
      }

      total += productResult.rows[0].price * item.quantity
    }

    const orderResult = await client.query(
      'INSERT INTO orders (total) VALUES ($1) RETURNING id',
      [total]
    )

    const orderId = orderResult.rows[0].id

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      )

      await client.query(
        `INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, rows[0].price]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      orderId,
      total
    })

  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}
