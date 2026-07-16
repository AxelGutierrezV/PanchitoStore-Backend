const resend = require("../config/resend");

exports.sendEmail = async (req, res) => {

  try {

    const {
      to,
      subject,
      html
    } = req.body;

    const response =
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html
      });

    res.json({
      message: "Correo enviado",
      response
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error enviando correo"
    });

  }

};