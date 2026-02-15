import express, {type Request, type Response} from 'express';
import cors from 'cors';
import {
    adminRouter, authRouter, bankingRouter, cuisinesRouter, loyaltyRouter, menuItemsRouter,
    orderPlacementRouter, ordersRouter, restaurantsRouter, usersRouter
} from './routes';

const app = express();

app.use(express.json());
app.use(cors());
app.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('it do be workin'); //TODO remove / replace with proper health check
});

// Delegate incoming requests to routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', orderPlacementRouter);
app.use('/api/restaurants/:restaurantId/orders', ordersRouter);
app.use('/api/restaurants/:restaurantId/menu-items', menuItemsRouter);
app.use('/api/cuisines', cuisinesRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/loyalty', loyaltyRouter);
app.use('/api/user', bankingRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at: http://localhost:${port}`);
});
