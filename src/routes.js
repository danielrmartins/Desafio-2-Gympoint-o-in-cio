import { Router } from 'express';

import UserControlller from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerHelpOrderController from './app/controllers/AnswerHelpOrderController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserControlller.store);
routes.post('/sessions', SessionController.store);

routes.post('/students/:student_id/checkins', CheckinController.store);
routes.get('/students/:student_id/checkins', CheckinController.show);

routes.post('/students/:student_id/help-orders', HelpOrderController.store);

routes.use(authMiddleware);

// routes.put('/users', UserControlller.update);
routes.post('/students', StudentController.store);
routes.put('/students/:studentId', StudentController.update);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.post('/enrollments/:student_id', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:enrollment_id', EnrollmentController.update);
routes.delete('/enrollments/:enrollment_id', EnrollmentController.delete);

routes.get('/help-orders', HelpOrderController.index);
routes.get('/students/:student_id/help-orders', HelpOrderController.show);
routes.post(
  '/help-orders/:help_order_id/answer',
  AnswerHelpOrderController.store
);

export default routes;
