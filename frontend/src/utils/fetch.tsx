
export const get = async (url: RequestInfo, params: Record<string, any> = {}, options: RequestInit = {}) => {
  try {
    const queryString = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");
    let apiUrl = url as string;
    if (queryString) {
      apiUrl = `${url}?${queryString}`;
    }
    const res = await fetch(apiUrl, options);
    if (!res.ok) {
      console.error("Network response was not ok");
    }
    return res.json();
  } catch (error) {
    console.error(error);
  }
}

export const post = async (url: RequestInfo, data: Object = {}, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      ...options,
    });
    if (!res.ok) {
      console.error("Failed request!");
    }
    return res.json();
  } catch (error) {
    console.error(error);
  }
}
