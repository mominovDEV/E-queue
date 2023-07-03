const { encode, decode } = require("../services/crypt");
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const otpGenerator = require("otp-generator");
// const uuid = require('uuid');

function addMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// const dates = {
//   convert:function(d){
//     return d.constructor ===
//   }
// }

//     new OTP
const newOtp = async (req, res) => {
  const { phone_number } = req.body;
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const now = new Date();
  const expiration_time = addMinutesToDate(now, 3);

  const newOtp = await pool.query(
    `INSERT INTO otp (id, otp, expiration_time) VALUES($1,$2,$3) returning id;`,
    [uuidv4(), otp, expiration_time]
  );

  const details = {
    timestamp: now,
    check: phone_number,
    success: true,
    message: "OTP sent to user",
    otp_id: newOtp.rows[0].id,
  };
  const encoded = await encode(JSON.stringify(details));
  return res.send({ Status: "Success", Details: encoded });
};


// addotp

const addOtp = async (req, res) => {
  try {
    const { id, otp, expiration_time, verified } = req.body;

    const newOtp = await pool.query(
      `
        INSERT INTO otp (id,otp,expiration_time,verified)
        values($1, $2, $3, $4) RETURNING *
        `,
      [id, otp, expiration_time, verified]
    );
    console.log(newOtp);
    res.status(200).json(newOtp.rows);
  } catch (error) {
    res.status(500).json("Serverda xatolik");
    console.log(error);
  }
};

const getOtp = async (req, res) => {
  try {
    const otps = await pool.query(`select * from otp`);
    res.status(200).send(otps.rows);
  } catch (error) {
    res.status(500).json("Serverda xatolik");
  }
};
const getOtpById = async (req, res) => {
  try {
    const id = req.params.id;
    const otp = await pool.query(
      `
            select * from otp where id = $1
            `,
      [id]
    );
    res.status(200).send(otp.rows);
  } catch (error) {
    res.status(500).json("Serverda xatolik");
  }
};
const deleteOtp = async (req, res) => {
  try {
    const id = req.params.id;
    const otps = await pool.query(`DELETE FROM otp WHERE id = $1`, [id]);
    res.status(200).json("Successfully deleted");
  } catch (error) {
    res.status(500).json("Serverda xatolik");
  }
};

const updateOtp = async (req, res) => {
  try {
    const id = req.params.id;
    const { otp, expiration_time, verified } = req.body;

    const newOtp = await pool.query(
      `
        UPDATE otp set otp = $1,expiration_time = $2,verified = $3
            WHERE id = $4
            RETURNING *
        `,
      [otp, expiration_time, verified, id]
    );
    res.status(200).json(newOtp.rows);
  } catch (error) {
    res.status(500).json("Serverda xatolik");
    console.log(error);
  }
};

module.exports = {
  addOtp,
  getOtp,
  getOtpById,
  updateOtp,
  deleteOtp,
};
