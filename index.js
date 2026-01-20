const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. Importar la nueva ruta de cotizaciones
const clientesRoutes = require('./routes/clientes');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const cotizacionesRoutes = require('./routes/cotizaciones'); // <--- Nueva línea

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/clientes', clientesRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/cotizaciones', cotizacionesRoutes); // <--- Nueva línea

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});