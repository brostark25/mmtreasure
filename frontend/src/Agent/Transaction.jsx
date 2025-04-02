import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  parse,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";

const TransactionPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [agents, setAgents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format number with commas and 2 decimal places
  const formatBalance = (value) => {
    if (value === undefined || value === null) return "0.00";
    const num = parseFloat(value);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const quickFilters = [
    {
      label: "TODAY",
      mmlabel: "ယနေ့",
      range: [
        new Date().setHours(0, 0, 0, 0),
        new Date().setHours(23, 59, 59, 999),
      ],
    },
    {
      label: "YESTERDAY",
      mmlabel: "မနေ့က",
      range: [
        subDays(new Date().setHours(0, 0, 0, 0), 1),
        subDays(new Date().setHours(23, 59, 59, 999), 1),
      ],
    },
    {
      label: "THIS WEEK",
      mmlabel: "ယခုအပတ်",
      range: [
        startOfWeek(new Date().setHours(0, 0, 0, 0)),
        endOfWeek(new Date().setHours(23, 59, 59, 999)),
      ],
    },
    {
      label: "LAST WEEK",
      mmlabel: "ပြီးခဲ့သည့်အပတ်",
      range: [
        startOfWeek(subWeeks(new Date().setHours(0, 0, 0, 0), 1)),
        endOfWeek(subWeeks(new Date().setHours(23, 59, 59, 999), 1)),
      ],
    },
    {
      label: "THIS MONTH",
      mmlabel: "ယခုလ",
      range: [
        startOfMonth(new Date().setHours(0, 0, 0, 0)),
        endOfMonth(new Date().setHours(23, 59, 59, 999)),
      ],
    },
    {
      label: "LAST MONTH",
      mmlabel: "ပြီးခဲ့သည့်လ",
      range: [
        startOfMonth(subMonths(new Date().setHours(0, 0, 0, 0), 1)),
        endOfMonth(subMonths(new Date().setHours(23, 59, 59, 999), 1)),
      ],
    },
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

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/transactionsrec`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { fromDate, toDate },
        }
      );

      if (response.status === 200) {
        const transactions = response.data.transactions;

        setAgents(
          transactions.filter(
            (tx) => tx.recipient_agent_id && tx.user_id === "Null"
          )
        );
        setMembers(
          transactions.filter(
            (tx) => tx.user_id && tx.recipient_agent_id === "Null"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fromDate, toDate]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        ယူနစ်အသွင်း/ထုတ်တင်ပြချက်
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">နေ့မှ</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">နေ့အထိ</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchTransactions}
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            ရှာမည်
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {quickFilters.map(({ label, mmlabel, range }) => (
          <button
            key={label}
            onClick={() => applyQuickFilter(range)}
            className="px-3 py-2 bg-gray-200 text-sm font-medium rounded-md hover:bg-gray-300"
          >
            {mmlabel}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-blue-500">Loading...</p>}

      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          အေးဂျင့်ယူနစ်အသွင်း/အထုတ်များ
        </h2>
        {agents.length === 0 ? (
          <p className="text-gray-500">
            အေးဂျင့်ယူနစ်အသွင်း/အထုတ်များရှာမတွေ့ပါ။
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">အေးဂျင့်အိုင်ဒီ</th>
                  <th className="border px-4 py-2">ယူနစ်အသွင်း</th>
                  <th className="border px-4 py-2">ယူနစ်အထုတ်</th>
                  <th className="border px-4 py-2">စုစုပေါင်း</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((tx) => (
                  <tr key={tx.id}>
                    <td className="border px-4 py-2">{tx.agent_id}</td>
                    <td className="border px-4 py-2">
                      {formatBalance(tx.deposit)}
                    </td>
                    <td className="border px-4 py-2">
                      {formatBalance(tx.withdraw)}
                    </td>
                    <td className="border px-4 py-2">{0.0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          ကစားသမားယူနစ်အသွင်း/အထုတ်များ
        </h2>
        {members.length === 0 ? (
          <p className="text-gray-500">
            ကစားသမားယူနစ်အသွင်း/အထုတ်များရှာမတွေ့ပါ။
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ကစားသမားအိုင်ဒီ</th>
                  <th className="border px-4 py-2">ယူနစ်အသွင်း</th>
                  <th className="border px-4 py-2">ယူနစ်အထုတ်</th>
                  <th className="border px-4 py-2">စုစုပေါင်း</th>
                </tr>
              </thead>
              <tbody>
                {members.map((tx) => (
                  <tr key={tx.id}>
                    <td className="border px-4 py-2">{tx.user_id}</td>
                    <td className="border px-4 py-2">
                      {formatBalance(tx.deposit)}
                    </td>
                    <td className="border px-4 py-2">
                      {formatBalance(tx.withdraw)}
                    </td>
                    <td className="border px-4 py-2">{0.0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
