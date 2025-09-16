import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { ProductManagerDB } from './dao/ProductManagerDB.js';
import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerceDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' Conectado a MongoDB'))
.catch(error => console.error(' Error al conectar a MongoDB:', error));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/', viewsRouter);

// Servidor HTTP + WebSockets
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export const io = new Server(httpServer);

// WebSockets
const manager = new ProductManagerDB();

io.on('connection', async (socket) => {
  console.log(' Nuevo cliente conectado vía WebSocket');

  try {
    const productos = await manager.getProducts({});
    socket.emit('products-updated', productos.docs); // Enviar sólo los docs

    socket.on('new-product', async (productData) => {
      await manager.addProduct(productData);
      const productosActualizados = await manager.getProducts({});
      io.emit('products-updated', productosActualizados.docs);
    });

    socket.on('delete-product', async (productId) => {
      await manager.deleteProduct(productId);
      const productosActualizados = await manager.getProducts({});
      io.emit('products-updated', productosActualizados.docs);
    });

  } catch (error) {
    console.error(' Error en socket:', error.message);
  }
});
