const CreateXavia = async (url: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/createXavia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${import.meta.env.VITE_API_KEY}`,
      },
      body: JSON.stringify({
        url,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create xavia");
    }

    return data;
  } catch (error: any) {
    console.log("Error handling creating xavia: ", error);
    throw new Error(error.message || "Error handling creating xavia");
  }
};

const TalkToXavia = async (chatId: string, prompt: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/talkToXavia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${import.meta.env.VITE_API_KEY}`,
      },
      body: JSON.stringify({
        chatId,
        prompt,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to talk to xavia");
    }

    return data;
  } catch (error: any) {
    console.log("Error handling talk to xavia: ", error);
    throw new Error(error.message || "Error handling talk to xavia");
  }
};

const GetChatHistory = async (chatId: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/${chatId}/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${import.meta.env.VITE_API_KEY}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch chat history");
    }

    return data;
  } catch (error: any) {
    console.log("Error handling chat history: ", error);
    throw new Error(error.message || "Error handling fetch chat history");
  }
};

export { CreateXavia, TalkToXavia, GetChatHistory };
