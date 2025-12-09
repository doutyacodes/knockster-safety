export default {
  schema: "./utils/schema/**/*.{js,ts}", // ✅ Load all files recursively
    dialect: 'mysql',
    dbCredentials: {
        host: "68.178.163.247",
        user: "devuser_knockster_safety",
        database: "devuser_knockster_safety",
        password: "devuser_knockster_safety"
    }
};

// export default {
//   schema: "./utils/schema/**/*.{js,ts}", // ✅ Load all files recursively
//   dialect: "mysql",
//   dbCredentials: {
//     host: "localhost",
//     user: "root",
//     database: "devuser_safety_monitor",
//   },
// };