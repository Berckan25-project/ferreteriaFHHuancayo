const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});