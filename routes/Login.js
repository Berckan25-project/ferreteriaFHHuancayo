const express = require('express');
const router = express.Router(); 
const { OAuth2Client } = require('google-auth-library');
const db = require('../db'); 

const client = new OAuth2Client('777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com'); 

router.post('/google', async (req, res) => {
    const { idToken } = req.body; 

    if (!idToken) {
        return res.status(400).json({ success: false, msg: "No se proporcionó el Token" });
    }

    try {
        
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: '777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com', 
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;

        
        db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, rows) => {
            if (err) {
                console.error("Error al buscar usuario:", err);
                return res.status(500).json({ success: false, msg: "Error en base de datos" });
            }

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
                    if (errInsert) {
                        console.error("Error al insertar:", errInsert);
                        return res.status(500).json({ success: false, msg: "Error al registrar usuario" });
                    }
                    
                    nuevoUsuario.id_usuario = result.insertId;
                    res.json({ success: true, usuario: nuevoUsuario });
                });
            }
        });
    } catch (e) {
        console.error("Error de verificación Google:", e);
        res.status(401).json({ success: false, msg: "Token inválido" });
    }
});


module.exports = router;