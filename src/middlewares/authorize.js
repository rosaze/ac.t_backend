module.exports = function authorize(roles = []) {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (
      !req.user ||
      (roles.length && !roles.some((role) => req.user.roles.includes(role)))
    ) {
      return res.status(403).json({ message: "Access Denied" });
    }

    next();
  };
};
