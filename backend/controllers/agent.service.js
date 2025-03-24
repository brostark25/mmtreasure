export const validateAgentExists = async (connection, agentId) => {
  const [agentCheck] = await connection.query(
    "SELECT agid FROM agents WHERE agid = ? FOR UPDATE",
    [agentId]
  );
  if (agentCheck.length === 0) {
    throw new Error("Agent ID not found.");
  }
};

export const updateAgentBalanceAndDbalance = async (
  connection,
  agentId,
  amount
) => {
  const [agentBalanceResult] = await connection.query(
    "SELECT balance, dbalance FROM agents WHERE agid = ? FOR UPDATE",
    [agentId]
  );

  if (agentBalanceResult.length === 0) {
    throw new Error("Agent not found.");
  }

  const agentBalance = parseFloat(agentBalanceResult[0].balance);
  const agentDbalance = parseFloat(agentBalanceResult[0].dbalance);

  if (agentBalance < amount) {
    throw new Error("Insufficient agent balance.");
  }

  const updatedBalance = agentBalance - amount;
  const updatedDbalance = agentDbalance + amount;

  await connection.query(
    "UPDATE agents SET balance = ?, dbalance = ? WHERE agid = ?",
    [updatedBalance, updatedDbalance, agentId]
  );
};

export const updateAgentBalance = async (connection, agentId, amount) => {
  const [agentBalanceResult] = await connection.query(
    "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
    [agentId]
  );

  if (agentBalanceResult.length === 0) {
    throw new Error("Agent not found.");
  }

  const agentBalance = parseFloat(agentBalanceResult[0].balance);
  if (agentBalance < amount) {
    throw new Error("Insufficient agent balance.");
  }

  const updatedBalance = agentBalance - amount;
  await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
    updatedBalance,
    agentId,
  ]);
};
