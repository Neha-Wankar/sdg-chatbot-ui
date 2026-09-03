import axiosClient from "./axiosClient";
import API_ENDPOINTS from "./apiEndpoints";

export async function loginApi(username, password) {
  const response = await axiosClient.post(API_ENDPOINTS.auth.login, null, {
    params: {
      user_id: username,
      password,
    },
  });

  return response.data;
}
