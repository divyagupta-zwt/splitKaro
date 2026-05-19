const { Group, Member, sequelize } = require("../models");

exports.createGroup = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({ name: name?.trim(), description: description?.trim() }, { transaction: t });

    const memberRows = members.map((m) => ({
      group_id: group.id,
      name: m.name?.trim(),
      email: m.email?.trim(),
      phone: m.phone?.trim() || null,
    }));

    await Member.bulkCreate(memberRows, {
      transaction: t,
      validate: true,
    });

    await t.commit();

    const createdGroup = await Group.findByPk(group.id, {
      include: [{ model: Member, as: "members" }],
    });

    res.status(201).json(createdGroup);
  } catch (e) {
    if (t) await t.rollback();
    console.error("Error: ", e.message);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      attributes: ["id", "name", "description"],
      include: [
        {
          model: Member,
          as: "members",
          attributes: ["id", "group_id", "name", "email", "phone"],
        },
      ],
    });

    res.json(group);
  } catch (e) {
    console.error("Error: ", e.message);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
};

exports.fetchGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(groups);
  } catch (e) {
    console.error("Error: ", e.message);
    res.status(500).json({ error: e.message || 'Internal Server Error' });
  }
};
