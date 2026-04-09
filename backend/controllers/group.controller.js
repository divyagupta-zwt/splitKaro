const { Group, Member, sequelize } = require('../models');

exports.createGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'At least one member is required' });
    }

    const group = await Group.create({ name, description }, { transaction: t });

    const memberRows = members.map(m => ({
      group_id: group.id,
      name: m.name,
      email: m.email,
      phone: m.phone || null
    }));

    await Member.bulkCreate(memberRows, {
      transaction: t,
      validate: true
    });

    await t.commit();

    const createdGroup = await Group.findByPk(group.id, {
      include: [{ model: Member, as: 'members' }]
    });

    res.status(201).json(createdGroup);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getGroup = async (req, res, next) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description'],
      include: [{ model: Member, as: 'members', attributes: ['id', 'group_id', 'name', 'email', 'phone'] }]
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    next(err);
  }
};
