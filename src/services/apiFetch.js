import { BASE_URI, TOKEN_KEY } from '../config';

export default async function apiFetch(
  endpoint,
  { method, headers, body } = {}
) {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) {
    headers = {
      Authorization: `Token token=${token}`,
      ...headers,
    };
  }

  if (body) {
    headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  const config = {
    method: method || (body ? 'POST' : 'GET'),
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  const response = await fetch(BASE_URI + endpoint, config);

  let data;
  if (!response.ok) {
    if (token && response.status == 401) {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    try {
      data = await response.json();
      if (response.status == 401) data = null;
    } catch (error) {
      console.log(error)
    }
  }

  try {
    data = await response.json();
  } catch (error) {
    data = response.statusText;
  }

  return data;
}
