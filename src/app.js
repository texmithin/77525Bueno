import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import productRoutes from './routes/products.routes.js';
import cartRoutes from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/', viewsRouter);

// Servidor HTTP + WebSockets
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export const io = new Server(httpServer);

// Websockets
const manager = new ProductManager();

io.on('connection', async (socket) => {
  console.log('Nuevo Cliente conectado');

  const productos = await manager.getProducts();
  socket.emit('products-updated', productos);

  socket.on('new-product', async (productData) => {
    await manager.addProduct(productData);
    const productosActualizados = await manager.getProducts();
    io.emit('products-updated', productosActualizados);
  });

  socket.on('delete-product', async (productId) => {
    await manager.deleteProduct(productId);
    const productosActualizados = await manager.getProducts();
    io.emit('products-updated', productosActualizados);
  });
});