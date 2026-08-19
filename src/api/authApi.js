import axiosClient from "./axiosClient";

export async function loginApi(username, password) {
  const response = await axiosClient.post("/login", null, {
    params: { user_id: username, password }
  });
  return response.data;
}
