import { Router } from 'express';
import { ProductManagerDB } from '../dao/ProductManagerDB.js';

const router = Router();
const productManager = new ProductManagerDB();

// Redirección desde / hacia /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

// Página de productos con paginación, búsqueda y ordenamiento
router.get('/products', async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;

    const {
      docs,
      totalPages,
      hasPrevPage,
      hasNextPage,
      nextPage,
      prevPage,
      page: currentPage
    } = await productManager.getProducts({ limit, page, sort, query });

    res.render('index', {
      products: docs,
      pagination: {
        totalPages,
        hasPrevPage,
        hasNextPage,
        nextPage,
        prevPage,
        page: currentPage,
        query,
        sort
      }
    });
  } catch (error) {
    res.status(500).send('Error al obtener productos: ' + error.message);
  }
});

export default router;
