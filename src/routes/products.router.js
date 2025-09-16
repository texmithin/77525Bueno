import { Router } from 'express';
import { Product } from '../models/Product.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = {};
    if (query) {
      const q = String(query).trim();
      if (/^status:(true|false)$/i.test(q)) {
        filter.status = q.split(':')[1].toLowerCase() === 'true';
      } else if (/^category:/i.test(q)) {
        filter.category = q.split(':')[1];
      } else {
        filter.category = q;
      }
    }

    let sortOption = {};
    if (sort && ['asc', 'desc'].includes(String(sort))) {
      sortOption = { price: sort === 'asc' ? 1 : -1 };
    }

    const options = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sort: sortOption,
      lean: true
    };

    const result = await Product.paginate(filter, options);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const mkLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams();
      params.set('page', targetPage);
      params.set('limit', options.limit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      return `${baseUrl}?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: mkLink(result.hasPrevPage ? result.prevPage : null),
      nextLink: mkLink(result.hasNextPage ? result.nextPage : null)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

import mongoose from 'mongoose';

// DEBUG: ver en qué DB estoy y cuántos products hay
router.get('/_debug', async (_req, res) => {
  const dbName = mongoose.connection.name;
  const count = await Product.countDocuments({});
  const sample = await Product.find({}).limit(3).lean();
  res.json({ dbName, count, sample });
});

export default router;
