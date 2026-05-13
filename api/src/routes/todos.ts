import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  uploadImage,
  deleteImage,
} from '../controllers/todos.controller';

const router = Router();

router.get('/', listTodos);
router.post('/', createTodo);
router.get('/:id', getTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);
router.post('/:id/image', upload.single('image'), uploadImage);
router.delete('/:id/image', deleteImage);

export default router;
