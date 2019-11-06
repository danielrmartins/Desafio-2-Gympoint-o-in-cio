import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import AnswerHelpOrderMail from '../jobs/AnswerHelpOrderMail';

class AnswerHelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { help_order_id } = req.params;
    const { answer } = req.body;

    const helpOrder = await HelpOrder.findByPk(help_order_id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!helpOrder || helpOrder.answer_at !== null)
      return res
        .status(400)
        .json({ error: 'Invalid help order! It may be already answered!' });

    await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    await Queue.add(AnswerHelpOrderMail.key, { helpOrder });

    return res.json(helpOrder);
  }
}

export default new AnswerHelpOrderController();
