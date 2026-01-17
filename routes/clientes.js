const express = require('express');
const router = express.Router();
const conn = require('../db');

router.post('/', (req, res) => {
  const { nombre, email, telefono } = req.body;
  conn.query(
    'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)',
    [nombre, email, telefono],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ status: 'success', id: result.insertId });
    }
  );
});

router.get('/:id', (req, res) => {
  conn.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    rows.length > 0 ? res.json(rows[0]) : res.status(404).json({msg: "No existe"});
  });
});

router.get('/buscar/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  // Usamos % para que busque coincidencias en cualquier parte del nombre
  conn.query(
    'SELECT id_cliente, nombre, email, telefono FROM clientes WHERE nombre LIKE ?',
    [`%${nombre}%`],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
});

router.get('/:id/historial', (req, res) => {
  const id = req.params.id;
  conn.query(
    `SELECT v.id_venta, v.fecha, v.total, p.nombre, dv.cantidad, dv.subtotal
     FROM ventas v
     JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
     JOIN productos p ON dv.id_producto = p.id_producto
     WHERE v.id_cliente = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
});

module.exports = router;
