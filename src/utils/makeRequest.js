import axios from 'axios';
import { backend_url } from './urls';
import { getItem } from './localStorage';

function formatError(error) {
  if (error.response) {
    return `Error: ${error.response.status} - ${
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.statusText
    }`;
  }

  if (error.request) {
    return 'Error: No response received from server';
  }

  return `Error: ${error.message}`;
}

function withPayload(method, body) {
  return method === 'POST' || method === 'PUT' || method === 'PATCH'
    ? body
    : undefined;
}

export async function makeRequest(url, method, body) {
  try {
    const response = await axios({
      method,
      url: backend_url + url,
      data: withPayload(method, body),
      responseType: 'json',
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function makeRequest2(url, method, body) {
  try {
    const userDetails = await getItem('AGENTUSER');
    const token = userDetails?.authToken;

    const response = await axios({
      method,
      url: backend_url + url,
      data: withPayload(method, body),
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function makeRequest3(url, method, body) {
  try {
    const userDetails = await getItem('AGENTUSER');
    const token = userDetails?.authToken;
    const isFormData = body instanceof FormData;

    const response = await axios({
      method,
      url: backend_url + url,
      data: withPayload(method, body),
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function makeRequest4(url, method, body) {
  return makeRequest(url, method, body);
}

export async function makeRequest5(url, method, body) {
  return makeRequest(url, method || 'POST', body);
}
