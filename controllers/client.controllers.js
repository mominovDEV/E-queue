const pool = require("../config/db");
const addClient = async (req, res) =>  {
  try {
    const {
      client_last_name,
      client_first_name,
      client_phone_number,
      client_info,
      client_photo,
    } = req.body;

    const newClient = await pool.query(
      `
        INSERT INTO client (client_last_name,client_first_name,
            client_phone_number,client_info,clinet_photo)
            values($1, $2, $3, $4, $5,) RETURNING *
        `,
      [
        client_last_name,
        client_first_name,
        client_phone_number,
        client_info,
        client_photo,
      ]
    );
    console.log(newClient);
    res.status(200).json(newClient.rows);
  } catch (error) {
    res.status(500).json("Serverda xatolik");
  }
};
