const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com'); 

router.post('/google', async (req, res) => {
    const { idToken } = req.body; 

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: '777635003259-tioc5dan1551a9f162dgknorb4hvkv6c.apps.googleusercontent.com', 
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        
        conn.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, rows) => {
            if (rows.length > 0) {
                res.json({ success: true, usuario: rows[0] });
            } else {
               
                const nuevo = { nombre: name, email: email, password: 'google_user', rol: 'cliente' };
                conn.query('INSERT INTO usuarios SET ?', nuevo, (err, result) => {
                    nuevo.id_usuario = result.insertId;
                    res.json({ success: true, usuario: nuevo });
                });
            }
        });
    } catch (e) {
        res.status(401).json({ success: false, msg: "Token inválido" });
    }
});