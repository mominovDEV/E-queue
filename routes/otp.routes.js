const { Router } = require("express");
const {
  newOtp, verifyOTP,
  // addOtp,
  // getOtp,
  // updateOtp,
  // deleteOtp,
  // getOtpById,
} = require("../controllers/otp.controller");

const router = Router();

router.post("/newotp", newOtp);
router.post("/verify", verifyOTP);

// router.post("/", addOtp);
// router.get("/", getOtp);
// router.put("/:id", updateOtp);
// router.delete("/:id", deleteOtp);
// router.get("/:id", getOtpById);

module.exports = router;
