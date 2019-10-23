import { Router } from 'express';

import UserControlller from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserControlller.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// routes.put('/users', UserControlller.update);
routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

export default routes;
