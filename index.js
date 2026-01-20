const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const loginRoutes = require('./routes/Login');
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const cotizacionesRoutes = require('./routes/cotizaciones'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/login', loginRoutes);
app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/cotizaciones', cotizacionesRoutes); 

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});