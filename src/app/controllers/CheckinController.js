import { Op } from 'sequelize';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinController {
  async store(req, res) {
    const { student_id } = req.params;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists)
      return res.status(400).json({ error: "Student doesn't exists" });

    const today = Number(new Date());
    const startDate = Number(subDays(today, 7));
    const lastCheckins = await Checkin.findAll({
      where: {
        student_id,
        created_at: { [Op.between]: [startOfDay(startDate), endOfDay(today)] },
      },
    });

    if (lastCheckins && lastCheckins.length >= 5)
      return res
        .status(401)
        .json('You can only check-in 5 times every 7 days!');

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }

  async show(req, res) {
    const { student_id } = req.params;

    const studentExists = await Student.findByPk(student_id);

    if (!studentExists)
      return res.status(400).json({ error: "Student doesn't exists" });

    const checkins = await Checkin.findAll({ where: { student_id } });

    return res.json(checkins);
  }
}

export default new CheckinController();
