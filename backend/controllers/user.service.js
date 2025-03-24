// export const validateUserExists = async (connection, userId) => {
//   const [userCheck] = await connection.query(
//     "SELECT uid FROM users WHERE uid = ? FOR UPDATE",
//     [userId]
//   );
//   if (userCheck.length === 0) {
//     throw new Error("User ID not found.");
//   }
// };

export const validateUserExists = async (connection, userId) => {
  const [userCheck] = await connection.query(
    "SELECT uid FROM users WHERE uid = ?",
    [userId]
  );

  if (userCheck.length === 0) {
    throw new Error("User ID not found.");
  }
};

export const updateUserBalance = async (connection, userId, amount) => {
  const [userBalanceResult] = await connection.query(
    "SELECT balance FROM users WHERE uid = ? FOR UPDATE",
    [userId]
  );

  if (userBalanceResult.length === 0) {
    throw new Error("User not found.");
  }

  const userBalance = parseFloat(userBalanceResult[0].balance);
  const updatedBalance = userBalance + amount;

  await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
    updatedBalance,
    userId,
  ]);
};
