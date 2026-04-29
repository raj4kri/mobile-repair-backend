module.exports = {
  superadmin: [
    "manage_users",
    "manage_products",
    "manage_categories",
    "manage_team",
    "manage_slider"   // ✅ ADD THIS
  ],
  admin: [
    "manage_products",
    "manage_categories",
    "manage_team",
    "manage_slider"   // ✅ ADD THIS
  ],
  manager: ["manage_products"],
};