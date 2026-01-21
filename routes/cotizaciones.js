const express = require('express');
const router = express.Router();
const db = require('../db'); 

// --- 1. GUARDAR NUEVA COTIZACIÓN ---
router.post('/guardar', (req, res) => {
    const { id_usuario, total, detalles } = req.body;

    // Validación básica
    if (!id_usuario || !total || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error("Error Transaction:", err);
            return res.status(500).json({ error: "Error al iniciar transacción" });
        }

        // AGREGAMOS 'estado' con valor 'Pendiente' por defecto
        const queryCabecera = 'INSERT INTO cotizaciones (id_usuario, total, fecha, estado) VALUES (?, ?, NOW(), "Pendiente")';
        
        db.query(queryCabecera, [id_usuario, total], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error Cabecera:", err);
                    res.status(500).json({ error: "Error al guardar cabecera" });
                });
            }

            const idCotizacion = result.insertId; 

            const valoresDetalles = detalles.map(d => [
                idCotizacion, 
                d.id_producto, 
                d.cantidad, 
                d.precio_unitario
            ]);

            const queryDetalles = 'INSERT INTO detalles_cotizacion (id_cotizacion, id_producto, cantidad, precio_unitario) VALUES ?';
            
            db.query(queryDetalles, [valoresDetalles], (errDet) => {
                if (errDet) {
                    return db.rollback(() => {
                        console.error("Error Detalles:", errDet);
                        res.status(500).json({ error: "Error al guardar detalles" });
                    });
                }

                db.commit((errCommit) => {
                    if (errCommit) {
                        return db.rollback(() => {
                            res.status(500).json({ error: "Error al confirmar cambios" });
                        });
                    }
                    
                    res.status(200).json({ 
                        success: true, 
                        message: "Cotización registrada con éxito",
                        id_cotizacion: idCotizacion 
                    });
                });
            });
        });
    });
});


// --- 2. LISTAR TODAS LAS COTIZACIONES (Incluye la columna estado) ---
router.get('/todas', (req, res) => {
    // IMPORTANTE: Se agregó c.estado en el SELECT
    const sql = `
        SELECT 
            c.id_cotizacion, 
            u.nombre AS cliente, 
            c.total, 
            c.fecha,
            c.estado
        FROM cotizaciones c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        ORDER BY c.fecha DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Error al obtener cotizaciones:", err);
            return res.status(500).json({ error: "Error al obtener lista" });
        }
        res.json(rows); // Ahora Android recibirá el campo 'estado' y no fallará
    });
});


// --- 3. OBTENER DETALLE DE UNA COTIZACIÓN ---
router.get('/detalle/:id', (req, res) => {
    const idCotizacion = req.params.id;

    const sql = `
        SELECT 
            d.id_producto, 
            p.nombre, 
            d.cantidad, 
            d.precio_unitario, 
            (d.cantidad * d.precio_unitario) AS subtotal
        FROM detalles_cotizacion d
        JOIN productos p ON d.id_producto = p.id_producto
        WHERE d.id_cotizacion = ?
    `;

    db.query(sql, [idCotizacion], (err, rows) => {
        if (err) {
            console.error("Error al obtener detalles:", err);
            return res.status(500).json({ error: "Error al obtener detalles" });
        }
        res.json(rows);
    });
});

module.exports = router;