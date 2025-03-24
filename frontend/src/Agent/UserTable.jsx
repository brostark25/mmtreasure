import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faKey,
  faCopy,
  faLock,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const UserTable = ({
  users,
  onAddBalance,
  onWithdrawBalance,
  onShowAllUsers,
  onSettings,
  onAddUser,
  onUpdatePassword,
  onEditActiveStatus,
  loggedInAgentId,
  isReferralAgent,
}) => {
  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold">User</h2>
        <button
          onClick={onAddUser}
          className="bg-blue-500 text-white px-3 py-2 rounded-md"
        >
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-xs sm:text-sm">
              <th className="border p-2">User ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Currency</th>
              <th className="border p-2">Balance</th>
              <th className="border p-2">Function</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Last Login/Created Time</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td className="border p-2">{user.uid}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.currency}</td>
                <td className="border p-2">{user.balance}</td>
                <td className="border p-2">
                  <div className="flex space-x-2">
                    {!isReferralAgent && (
                      <>
                        <button
                          className="text-blue-500"
                          onClick={() => onAddBalance(user)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>

                        <button
                          className="text-blue-500"
                          onClick={() => onWithdrawBalance(user)}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      </>
                    )}

                    <button
                      className="text-blue-500"
                      onClick={() => onUpdatePassword(user)} // Add this button
                    >
                      <FontAwesomeIcon icon={faKey} />
                    </button>
                    <button className="text-blue-500">
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      className="text-blue-500"
                      onClick={() => onEditActiveStatus(user)}
                    >
                      <FontAwesomeIcon icon={faLock} />
                    </button>
                    <button
                      className="text-blue-500"
                      onClick={() => onSettings(user)}
                    >
                      <FontAwesomeIcon icon={faCog} />
                    </button>
                  </div>
                </td>
                <td className="border p-2">
                  {user.active ? "Active" : "Inactive"}
                </td>
                <td className="border p-2">{user.createdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="text-blue-500 mt-4" onClick={onShowAllUsers}>
        More...
      </button>
    </div>
  );
};

export default UserTable;
