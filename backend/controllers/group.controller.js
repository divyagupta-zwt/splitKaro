const { Group, Member, sequelize } = require("../models");

exports.createGroup = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({ name: name?.trim(), description: description?.trim() }, { transaction: t });

    const creatorEmail = req.user.email.toLowerCase().trim();
    const hasCreator = members.some(m => m.email?.toLowerCase().trim() === creatorEmail);

    const memberRows = members.map((m) => ({
      group_id: group.id,
      name: m.name?.trim(),
      email: m.email?.trim().toLowerCase(),
      phone: m.phone?.trim() || null,
    }));

    if (!hasCreator) {
      memberRows.unshift({
        group_id: group.id,
        name: req.user.name,
        email: creatorEmail,
        phone: null
      });
    }

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
    if (t && !t.finished) await t.rollback();
    next(e);
  }
};

exports.getGroup = async (req, res, next) => {
  try {
    res.json(req.group);
  } catch (e) {
    next(e);
  }
};

exports.fetchGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      include: [{
        model: Member,
        as: "members",
        where: { email: req.user.email },
        attributes: []
      }],
      order: [["createdAt", "DESC"]],
    });

    res.json(groups);
  } catch (e) {
    next(e);
  }
};
