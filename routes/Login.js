const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');

const client = new OAuth2Client('777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com');

// --- MÉTODO 1: INGRESO TRADICIONAL (Botón INGRESAR) ---
router.post('/tradicional', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "Faltan datos" });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, rows) => {
        if (err) {
            console.error("Error en Login:", err);
            return res.status(500).json({ success: false, msg: "Error del servidor" });
        }

        if (rows.length > 0) {
            // Usuario encontrado
            res.json({ success: true, usuario: rows[0] });
        } else {
            // No coincide correo o contraseña
            res.status(401).json({ success: false, msg: "Credenciales incorrectas" });
        }
    });
});

// --- MÉTODO 2: GOOGLE (Botón CONTINUAR CON GOOGLE) ---
router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, msg: "No hay token" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: '777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, rows) => {
            if (err) return res.status(500).json({ success: false, msg: "Error DB" });

            if (rows && rows.length > 0) {
                res.json({ success: true, usuario: rows[0] });
            } else {
                const nuevoUsuario = {
                    nombre: name,
                    email: email,
                    password: 'google_user',
                    rol: 'cliente'
                };

                db.query('INSERT INTO usuarios SET ?', nuevoUsuario, (errInsert, result) => {
                    if (errInsert) return res.status(500).json({ success: false });
                    nuevoUsuario.id_usuario = result.insertId;
                    res.json({ success: true, usuario: nuevoUsuario });
                });
            }
        });
    } catch (e) {
        res.status(401).json({ success: false, msg: "Token inválido" });
    }
});

module.exports = router;