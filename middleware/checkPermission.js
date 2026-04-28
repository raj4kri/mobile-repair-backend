const rolePermissions = require("../config/roles");

const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role;
    const allowedPermissions = rolePermissions[userRole] || [];

    // convert single → array
    const permissionsArray = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = permissionsArray.some((perm) =>
      allowedPermissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = checkPermission;