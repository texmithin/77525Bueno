import { Router } from 'express';
import { ProductManagerDB } from '../dao/ProductManagerDB.js';

const productManager = new ProductManagerDB();
const router = Router();
const manager = new ProductManagerDB();

// GET paginado con filtros y ordenamiento
router.get('/', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query
    } = req.query;

    const filter = {};

    // Filtro por disponibilidad
    if (query === 'disponibles') {
      filter.stock = { $gt: 0 };
    } else if (query === 'agotados') {
      filter.stock = { $lte: 0 };
    } else if (query) {
      // Filtro por categoría
      filter.category = query;
    }

    const sortOption = {};
    if (sort === 'asc') {
      sortOption.price = 1;
    } else if (sort === 'desc') {
      sortOption.price = -1;
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOption
    };

    const result = await manager.paginateProducts(filter, options);

    // Armado de links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const createLink = (pageNum) => `${baseUrl}?page=${pageNum}&limit=${limit}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`;

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? createLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? createLink(result.nextPage) : null
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;