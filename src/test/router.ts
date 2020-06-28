import { Router } from 'express';
import Controller from './controller';
import Validator from './validator';

const routes = Router({ mergeParams: true });
const controller = new Controller();
const validator = new Validator();


routes.put('/', validator.test, controller.test);


export default routes;
