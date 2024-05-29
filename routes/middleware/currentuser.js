const jwt = require("jsonwebtoken");

const currentUser = (req, res, next) => {
  const authToken = req.header("authToken");
  if (!authToken) {
    return res.status(401).json({ error: "unauthorized access" });
  }

  try {
    //this down line will check if anybtampering happened in authtoken or not.
    const legitUser = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = legitUser.user;
    next();
  } catch (error) {
    res.json({ error: "unauthorized access", error: error });
  }
};

module.exports = currentUser;
