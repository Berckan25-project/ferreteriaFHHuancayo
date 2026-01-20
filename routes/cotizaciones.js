const express = require('express');
const router = express.Router();
const db = require('./db'); // Asegúrate de que la ruta a tu conexión sea correcta

// Ruta: POST http://tu_ip:3000/api/cotizaciones/guardar
router.post('/guardar', (req, res) => {
    const { id_usuario, total, detalles } = req.body;

    // Validación básica
    if (!id_usuario || !total || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    // Iniciamos transacción para asegurar que se guarden ambas tablas o ninguna
    db.beginTransaction((err) => {
        if (err) {
            console.error("Error Transaction:", err);
            return res.status(500).json({ error: "Error al iniciar transacción" });
        }

        // 1. Insertar en la tabla principal (Cabecera)
        const queryCabecera = 'INSERT INTO cotizaciones (id_usuario, total, fecha) VALUES (?, ?, NOW())';
        db.query(queryCabecera, [id_usuario, total], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error Cabecera:", err);
                    res.status(500).json({ error: "Error al guardar cabecera" });
                });
            }

            const idCotizacion = result.insertId; // Obtenemos el ID generado

            // 2. Preparar los detalles para inserción masiva
            // Convertimos el array de objetos en un array de arrays: [[id, prod, cant, precio], ...]
            const valoresDetalles = detalles.map(d => [
                idCotizacion, 
                d.id_producto, 
                d.cantidad, 
                d.precio_unitario
            ]);

            // 3. Insertar en la tabla de detalles
            const queryDetalles = 'INSERT INTO detalles_cotizacion (id_cotizacion, id_producto, cantidad, precio_unitario) VALUES ?';
            db.query(queryDetalles, [valoresDetalles], (errDet) => {
                if (errDet) {
                    return db.rollback(() => {
                        console.error("Error Detalles:", errDet);
                        res.status(500).json({ error: "Error al guardar detalles" });
                    });
                }

                // 4. Si todo salió bien, confirmamos (Commit)
                db.commit((errCommit) => {
                    if (errCommit) {
                        return db.rollback(() => {
                            res.status(500).json({ error: "Error al confirmar cambios" });
                        });
                    }
                    // Respuesta exitosa
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

module.exports = router;