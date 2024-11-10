const BASE_URL = 'http://localhost:5001';

export const fetchData = async (url: string, method: string, body: any) => {
    try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined, // Установка body только если оно есть
    });

    if (response.status === 204) {
      return null; // Возвращаем null при ответе 204 No Content
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Unknown error occurred');
    }

    return data;
  } catch (error) {
    throw error; // Перекидываем ошибку дальше
  }
};
