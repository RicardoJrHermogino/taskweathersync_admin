import pool from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const [product] = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
      if (product.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(product[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  } else if (req.method === 'PUT') {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    try {
      await pool.query('UPDATE product SET name = ?, category = ? WHERE id = ?', [name, category, id]);
      res.status(200).json({ id, name, category });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM product WHERE id = ?', [id]);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
