import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const helpOrder = await HelpOrder.findAll({
      where: { answer_at: null },
      order: ['created_at'],
      attributes: ['id', 'question'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });
    return res.json(helpOrder);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string()
        .required()
        .min(10),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Your answer must have at least 10 characters' });
    }

    const { student_id } = req.params;
    const { question } = req.body;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists)
      return res.status(400).json({ error: "Student doesn't exists" });

    const helpOrder = await HelpOrder.create({
      student_id,
      question,
    });

    return res.json(helpOrder);
  }

  async show(req, res) {
    const { student_id } = req.params;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists)
      return res.status(400).json({ error: "Student doesn't exists" });

    const helpOrder = await HelpOrder.findAll({ where: { student_id } });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
