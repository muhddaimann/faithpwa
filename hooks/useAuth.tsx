import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { useStaffStore } from "../contexts/api/staffStore";
import { useToken } from "../contexts/tokenContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { staff, loading: isStaffLoading, error: staffError } = useStaffStore();
  const { getToken, saveToken, deleteToken } = useToken();

  const user = staff ? {
    username: staff.nick_name || staff.first_name,
    name: staff.full_name,
    staffId: staff.staff_no,
    designation: staff.designation_name,
    avatarText: staff.initials,
    ...staff
  } : null;

  return {
    ...context,
    user,
    isStaffLoading,
    staffError,
    getToken,
    saveToken,
    deleteToken,
  };
};
