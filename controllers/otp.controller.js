const { encode, decode } = require("../services/crypt");
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const otpGenerator = require("otp-generator");
// const uuid = require('uuid');

function addMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

const dates = {
  convert: function (d) {
    return d.constructor === Date
      ? d
      : d.constructor === Array
      ? new Date(d[0], d[1], d[2])
      : d.constructor === Number
      ? new Date(d)
      : d.constructor === String
      ? new Date(d)
      : typeof d === "object"
      ? new Date(d.year, d.month, d.date)
      : NaN;
  },
  compare: function (a, b) {
    return isFinite((a = this.convert(a).valueOf())) &&
      isFinite((start = this.convert(start).valueOf())) &&
      isFinite((end = this.convert(end).valueOf()))
      ? start <= d && d <= end
      : NaN;
  },
};

const verifyOTP = async (req, res) => {
  const { verification_key, otp, check } = req.body;
  var currentdate = new Date();
  let decoded;
  try {
    decoded = await decode(verification_key);
  } catch (error) {
    const response = { Status: "Failure", Details: "Bad Request" };
    return res.status(400).send(response);
  }

  var obj = JSON.parse(decoded);
  const check_obj = obj.check;
  console.log(obj);
  if (check_obj != check) {
    const response = {
      Status: "Failure",
      Details: "OTP wan not sent to this particular phone number",
    };
    return res.status(400).send(response);
  }

  const otpResult = await pool.query(`select * from otp where id = $1;`, [
    obj.otp_id,
  ]);

  const result = otpResult.rows[0];
  if (result != null) {
    if (result.verified != true) {
      if (dates.compare(result.expiration_time, currentdate) == 1) {
        if (otp === result.otp) {
          await pool.query(`UPDATE otp set verfied=$2 where id = $1;`, [
            result.id,
            true,
          ]);
          const clientResult = await pool.query(
            `select * from client where client_phone_number = $1;`,
            [check]
          );
          if (clientResult.rows.length == 0) {
            const response = {
              Status: "Success",
              Details: "new",
              Check: check,
            };
            return res.status(200).send(response);
          } else {
            const response = {
              Status: "Success",
              Details: "old",
              Check: check,
              ClientName: clientResult.rows[0].client_first_name,
            };
            return res.status(200).send(response);
          }
        } else {
          const response = { Status: "Failure", Details: "OTP not mathed" };
          return res.status(400).send(response);
        }
      } else {
        const response = { Status: "Failure", Details: "Otp expariet" };
        return res.status(400).send(response);
      }
    } else {
      const response = { Status: "Failure", Details: "Bad Request" };
      return res.status(400).send(response);
    }
  } else {
    const response = { Status: "Failure", Details: "Bad Request" };
    return res.status(400).send(response);
  }
};

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
  newOtp,
  verifyOTP,
  addOtp,
  getOtp,
  getOtpById,
  updateOtp,
  deleteOtp,
};
