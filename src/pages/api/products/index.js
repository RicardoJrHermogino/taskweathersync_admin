import pool from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [products] = await pool.query('SELECT * FROM product');
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else if (req.method === 'POST') {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    try {
      const [result] = await pool.query('INSERT INTO product (name, category) VALUES (?, ?)', [name, category]);
      res.status(201).json({ id: result.insertId, name, category });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
