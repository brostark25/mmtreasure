import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";

const ScoreLog = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromId, setFromId] = useState(""); // State for From ID filter
  const [toId, setToId] = useState(""); // State for To ID filter
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const quickFilters = [
    { label: "TODAY", range: [new Date(), new Date()] },
    { label: "YESTERDAY", range: [subDays(new Date(), 1), subDays(new Date(), 1)] },
    { label: "THIS WEEK", range: [startOfWeek(new Date()), endOfWeek(new Date())] },
    { label: "LAST WEEK", range: [startOfWeek(subWeeks(new Date(), 1)), endOfWeek(subWeeks(new Date(), 1))] },
    { label: "THIS MONTH", range: [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: "LAST MONTH", range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
  ];

  const applyQuickFilter = (range) => {
    setFromDate(format(range[0], "yyyy-MM-dd"));
    setToDate(format(range[1], "yyyy-MM-dd"));
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/transactionsrec`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fromDate, toDate, fromId, toId }, // Include fromId and toId in the request
      });

      if (response.status === 200) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fromDate, toDate, fromId, toId]); // Re-fetch when filters change

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Score Log</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <select className="border p-2 rounded-md w-full">
          <option value="">-- ALL --</option>
        </select>
        <input
          type="text"
          placeholder="From ID (Agent or User)"
          className="border p-2 rounded-md w-full"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        />
        <input
          type="text"
          placeholder="To ID (Agent or User)"
          className="border p-2 rounded-md w-full"
          value={toId}
          onChange={(e) => setToId(e.target.value)}
        />
        <button
          onClick={fetchTransactions}
          className="p-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600 transition"
        >
          Submit
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {quickFilters.map(({ label, range }) => (
          <button
            key={label}
            onClick={() => applyQuickFilter(range)}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-blue-500">Loading...</p>}

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-300 text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">DateTime</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">From ID</th>
              <th className="border px-4 py-2">To ID</th>
              <th className="border px-4 py-2">Before Balance</th>
              <th className="border px-4 py-2">Deposit</th>
              <th className="border px-4 py-2">Withdraw</th>
              <th className="border px-4 py-2">After Balance</th>
              <th className="border px-4 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border px-4 py-2">
                  <div className="flex flex-col space-y-2">
                    {/* Date and Time */}
                    <span className="text-sm text-gray-600">
                      {format(new Date(tx.date), "yyyy/MM/dd HH:mm:ss")}
                    </span>

                    {/* Amount Transition */}
                    <div className="flex items-center space-x-2">
                      {/* Before Amount */}
                      <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium">
                        {Number(tx.beforeamount).toFixed(2)}
                      </span>

                      {/* Arrow */}
                      <span className="text-gray-500">→</span>

                      {/* After Amount */}
                      <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium">
                        {Number(tx.withdraw) > 0.0
                          ? (Number(tx.beforeamount) - Number(tx.withdraw)).toFixed(2)
                          : (Number(tx.beforeamount) + Number(tx.deposit)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className={`border px-4 py-2 ${tx.type && tx.type.includes("Withdraw") ? "text-red-500" : ""}`}>
                	{tx.type}
              	</td>
                <td className="border px-4 py-2">
                  {tx.agent_id}
                </td>
                <td className="border px-4 py-2">
                  {tx.recipient_agent_id !== "Null"? tx.recipient_agent_id : tx.user_id} 
                </td>
                <td className="border px-4 py-2 text-green-500">{tx.beforeamount}</td>
                <td className="border px-4 py-2">{tx.deposit}</td>
                <td className="border px-4 py-2 text-red-500">- {tx.withdraw}</td>
                <td className="border px-4 py-2">{Number(tx.withdraw) > 0.00 ? (Number(tx.beforeamount) - Number(tx.withdraw)).toFixed(2) : (Number(tx.beforeamount) + Number(tx.deposit)).toFixed(2)}</td>
                <td className="border px-4 py-2">{tx.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreLog;
