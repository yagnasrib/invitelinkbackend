const Invite = require("../models/inviteModels");
const { v4: uuidv4 } = require("uuid");

// Controller for generating an invite link
const generateInvite = async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) return res.status(400).json({ error: "Chat ID is required" });

  const inviteCode = uuidv4();
  const newInvite = new Invite({ chatId, inviteCode });

  await newInvite.save();
  res.json({ inviteLink: `${process.env.FRONTEND_URL}/invite/${inviteCode}` });
};

// Controller for validating an invite code
const validateInvite = async (req, res) => {
  const { code } = req.params;
  const invite = await Invite.findOne({ inviteCode: code });

  if (!invite) return res.status(404).json({ error: "Invalid or expired invite" });

  res.json({ message: "Valid invite", chatId: invite.chatId });
};

module.exports = { generateInvite, validateInvite };
