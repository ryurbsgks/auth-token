const { Users } = require('../../models');
const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  // TODO: urclass의 가이드를 참고하여 GET /refreshtokenrequest 구현에 필요한 로직을 작성하세요.

  let token = req.cookies.refreshToken;

  if (!token) {

    res.status(400).json({
      "data": null,
      "message": "refresh token not provided"
    })

  } else {

    jwt.verify(token, process.env.REFRESH_SECRET, async (err, user_Info) => {
      if (err) {
        res.json({
          "data": null,
          "message": "invalid refresh token, please log in again"
        })
      } else if (user_Info) {
        let userInfo = await Users.findOne({
          where: {
            userId: user_Info.userId
          }
        });

        // id, userId, email, createdAt, updatedAt
        let payload = {
          id: userInfo.dataValues.id,
          userId: userInfo.dataValues.userId,
          email: userInfo.dataValues.email,
          createdAt: userInfo.dataValues.createdAt,
          updatedAt: userInfo.dataValues.updatedAt
        }

        res.status(200).json({
          data: {
            "accessToken": jwt.sign(payload, process.env.ACCESS_SECRET, {expiresIn: 60 * 60}),
            "userInfo": payload
          },
          "message": "ok"
        })

      }
    })

  }
};
