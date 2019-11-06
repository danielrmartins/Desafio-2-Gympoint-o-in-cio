import * as Yup from 'yup';
import { isBefore, parseISO, addMonths } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Queue from '../../lib/Queue';
import EnrollmentMail from '../jobs/EnrollmentMail';

class EnrollmentController {
  async index(req, res) {
    const enrollment = await Enrollment.findAll({
      order: ['start_date'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });
    return res.json(enrollment);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { student_id } = req.params;
    const { plan_id, start_date } = req.body;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists)
      return res.status(401).json({ error: "Student doesn't exists" });

    const plan = await Plan.findByPk(plan_id);

    if (!plan) return res.status(400).json({ error: "Plan doesn't exists" });

    const formattedDate = parseISO(start_date);

    if (isBefore(formattedDate, new Date()))
      return res.status(400).json({ error: 'Invalid start date!' });

    const enrolledStudent = await Enrollment.findOne({ where: { student_id } });

    if (enrolledStudent)
      return res
        .status(401)
        .json({ error: 'This student is already enrolled!' });

    const end_date = addMonths(formattedDate, plan.duration);
    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    const createdEnrollment = await Enrollment.findByPk(enrollment.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration'],
        },
      ],
    });

    await Queue.add(EnrollmentMail.key, { createdEnrollment });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { enrollment_id } = req.params;
    const { plan_id, start_date } = req.body;

    const enrollment = await Enrollment.findByPk(enrollment_id);

    if (!enrollment)
      return res.status(400).json({ error: "Enrollment doesn't exists" });

    const plan = await Plan.findByPk(plan_id);

    if (!plan) return res.status(400).json({ error: "Plan doesn't exists" });

    const formattedDate = parseISO(start_date);

    if (isBefore(formattedDate, new Date()))
      return res.status(400).json({ error: 'Invalid start date!' });

    const end_date = addMonths(formattedDate, plan.duration);
    const price = plan.duration * plan.price;

    return res.json(
      await enrollment.update({
        plan_id,
        start_date,
        end_date,
        price,
      })
    );
  }

  async delete(req, res) {
    const { enrollment_id } = req.params;

    const enrollment = await Enrollment.findByPk(enrollment_id);

    if (!enrollment)
      return res.status(400).json({ error: "Enrollment doesn't exists" });

    await Enrollment.destroy({ where: { id: enrollment_id } });

    return res.json({ message: 'Enrollment sucessfully removed' });
  }
}

export default new EnrollmentController();
