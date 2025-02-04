const express = require("express");


const {
  register,
  verifyEmail,
  login,
  getAllUsers,
//setAvatar,
searchUsers,
} = require("../controllers/UserController");

const router = express.Router();

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.get("/getAllUsers/:id", getAllUsers);
//// Complete route for setting avatar

router.post("/search", searchUsers);

router.post("/register", async (req, res) => {
  const { username, password, inviteToken } = req.body;

  if (inviteToken) {
      const invite = await Invite.findOne({ inviteToken });
      if (!invite) return res.status(400).json({ error: "Invalid invite link" });

      // Optionally, delete invite token after use
      await Invite.deleteOne({ inviteToken });
  }
});



module.exports = router;
