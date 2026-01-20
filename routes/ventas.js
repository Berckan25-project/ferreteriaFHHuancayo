const express = require('express');
const router = express.Router();
const conn = require('../db');


router.post('/', (req, res) => {
    const { id_cliente, productos } = req.body;

    const promesasValidacion = productos.map(p => {
        return new Promise((resolve, reject) => {
            conn.query('SELECT nombre, stock FROM productos WHERE id_producto = ?', [p.id_producto], (err, rows) => {
                if (err) return reject(err);
                if (rows.length === 0) return reject(`Producto ID ${p.id_producto} no existe`);
                if (rows[0].stock < p.cantidad) {
                    return reject(`Stock insuficiente para "${rows[0].nombre}". disponible: ${rows[0].stock}`);
                }
                resolve();
            });
        });
    });

    Promise.all(promesasValidacion)
        .then(() => {
            
            const total = productos.reduce((acc, p) => acc + (p.subtotal || 0), 0);

            conn.beginTransaction((err) => {
                if (err) return res.status(500).send(err);

                conn.query('INSERT INTO ventas (id_cliente, total, fecha) VALUES (?, ?, NOW())', [id_cliente, total], (err, result) => {
                    if (err) return conn.rollback(() => res.status(500).send(err));

                    const idVenta = result.insertId;
                    let completados = 0;

                    productos.forEach((p) => {
                        conn.query('INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)', 
                        [idVenta, p.id_producto, p.cantidad, p.subtotal], (err) => {
                            if (err) return conn.rollback(() => res.status(500).send(err));

                            
                            conn.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [p.cantidad, p.id_producto], (err) => {
                                if (err) return conn.rollback(() => res.status(500).send(err));

                                completados++;
                                if (completados === productos.length) {
                                    conn.commit((err) => {
                                        if (err) return conn.rollback(() => res.status(500).send(err));
                                        res.json({ status: 'success', idVenta });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        })
        .catch(errorMsg => {
            res.status(400).json({ message: errorMsg });
        });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  conn.query('DELETE FROM detalle_ventas WHERE id_venta = ?', [id]);
  conn.query('DELETE FROM ventas WHERE id_venta = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ status: 'deleted' });
  });
});

module.exports = router;
