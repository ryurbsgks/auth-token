const { Users } = require('../../models');
const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  // TODO: urclass의 가이드를 참고하여 GET /accesstokenrequest 구현에 필요한 로직을 작성하세요.

  // authorization header에 담긴 토큰이 서버에서 생성한 JWT인지 확인합니다.
  // 서버에서 생성한 유효한 토큰일 경우, 유효하지 않은 토큰일 경우 각각 다른 응답을 반환합니다.

  const authorization = req.headers['authorization'];

  if (!authorization) {

    res.status(400).send({ "data": null, "message": "invalid access token" });

  } else {

    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_SECRET, async (err, user_Info) =>{

      let userInfo = await Users.findOne({
        where: {
          userId: user_Info.userId
        }
      })
  
      // id, userId, email, createdAt, updatedAt
      let payload = {
        id: userInfo.dataValues.id,
        userId: userInfo.dataValues.userId,
        email: userInfo.dataValues.email,
        createdAt: userInfo.dataValues.createdAt,
        updatedAt: userInfo.dataValues.updatedAt
      }
  
      res.status(200).send({
        "data": {
          "userInfo": payload
        },
        "message": "ok"
      })

    });

  }
};
