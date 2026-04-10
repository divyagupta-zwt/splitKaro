exports.getGroupSettlements = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      include: [
        { model: Member, as: 'payer' },
        { model: Member, as: 'receiver' }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(settlements);
  } catch (err) {
    next(err);
  }
};