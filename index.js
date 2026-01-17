require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http'); // 👈 Importamos serverless-http

const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);

app.get('/', (req, res) => { 
    res.send('API Ferretería funcionando 🚀'); 
});

// 🚀 En modo serverless NO usamos app.listen
module.exports = require('serverless-http')(app);

