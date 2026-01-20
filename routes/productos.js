const express = require('express');
const router = express.Router();
const conn = require('../db');


router.get('/buscar/:nombre', (req, res) => {
    const query = `%${req.params.nombre}%`;
    conn.query(
        'SELECT * FROM productos WHERE nombre LIKE ? LIMIT 10',
        [query],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.json(rows);
        }
    );
});


router.get('/reporte/critico', (req, res) => {
    conn.query(
        'SELECT * FROM productos WHERE stock < 5',
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.json(rows);
        }
    );
});


router.get('/', (req, res) => {
    conn.query('SELECT * FROM productos', (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// 4. INSERTAR PRODUCTO
router.post('/', (req, res) => {
    const { nombre, precio, stock } = req.body;
    conn.query(
        'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
        [nombre, precio, stock],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ status: 'success', id_producto: result.insertId });
        }
    );
});

// 5. OBTENER PRODUCTO POR ID
router.get('/:id', (req, res) => {
    conn.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).send(err);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).send('No encontrado');
    });
});

// 6. ACTUALIZAR PRODUCTO
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { precio, stock } = req.body;
    conn.query(
        'UPDATE productos SET precio = ?, stock = ? WHERE id_producto = ?',
        [precio, stock, id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.json({ status: 'updated' });
        }
    );
});

module.exports = router;