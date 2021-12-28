const { Users } = require('../../models');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // TODO: urclass의 가이드를 참고하여 POST /login 구현에 필요한 로직을 작성하세요.

  let userInfo = await Users.findOne({
    where:{
      userId:req.body.userId,
      password:req.body.password
    }
  })
  
  if(!userInfo){
    
    res.status(400).send({ "data": null, "message": "not authorized" });

  }else{

    // id, userId, email, createdAt, updatedAt
    let payload = {
      id:userInfo.dataValues.id,
      userId:userInfo.dataValues.userId,
      email:userInfo.dataValues.email,
      createdAt:userInfo.dataValues.createdAt,
      updatedAt:userInfo.dataValues.updatedAt
    }

    // access token, refresh token
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn : 60 * 60 });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn : "1d" });

    res.status(200).cookie("refreshToken", refreshToken).send({ "data": { "accessToken": accessToken }, "message": "ok" });
  
  }
};
