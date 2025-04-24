import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Menu } from "lucide-react";
import { CreateXavia, TalkToXavia, GetChatHistory } from "./function";
import Alert from "./components/ui/alert";
import SideBar from "./components/SideBar";
import DOMPurify from 'dompurify';
import { stripHTML } from "./utils";

const ChatApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [websiteInput, setWebsiteInput] = useState("");
  const [savedWebsites, setSavedWebsites] = useState<any[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<any>({});
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  // Load saved websites on mount and select the first one by default
  useEffect(() => {
    const stored = localStorage.getItem("savedWebsites");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSavedWebsites(parsed);
      if (parsed.length > 0) {
        setActiveWebsite(parsed[0]);
        setChatId(parsed[0].id);
      }
    }
  }, []);

  // Load chat history when chatId changes
  useEffect(() => {
    if (!chatId) return;

    const fetchChatHistory = async () => {
      await loadChatHistory();
    };

    fetchChatHistory();
  }, [chatId]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const saveWebsite = async () => {
    if (!websiteInput.trim()) {
      setMsg("Choose a website or enter a new website URL");
      setAlertType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await CreateXavia(websiteInput);
      const updated = Array.from(new Set([...savedWebsites, response]));

      setSavedWebsites(updated);
      localStorage.setItem("savedWebsites", JSON.stringify(updated));

      setActiveWebsite(response);
      setWebsiteInput("");
      setChatId(response.id);
      setMsg("Website saved successfully.");
      setAlertType("success");
    } catch (error) {
      console.error("Error saving website:", error);
      setMsg("Something went wrong while saving this website.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      if (!chatId) return;
      const response = await GetChatHistory(chatId);

      // Strip HTML from all messages before setting state
      const cleanedMessages =
        response?.history.map((msg: any) => ({
          ...msg,
          message: stripHTML(msg.message), // Clean each message
        })) || [];
      setMessages(cleanedMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentIndex = messages.length;
    const userMessage: any = stripHTML(input); // Strip HTML here

    setInput("");

    // Add user's message and a placeholder for the model
    const tempMessages = [
      ...messages,
      { role: "user", message: userMessage },
      { role: "model", message: "Responding..." },
    ];
    setMessages(tempMessages);
    setProcessing(true);
    setProcessingIndex(currentIndex + 1);

    try {
      if (activeWebsite?.id) {
        const response = await TalkToXavia(activeWebsite.id, userMessage);

        // Strip all HTML/code tags from the response message
        const rawText = response?.message || "";
        const plainText = stripHTML(rawText); // Strip HTML here

        const updatedMessages = [...tempMessages];
        updatedMessages[currentIndex + 1] = {
          role: "model",
          message:
            plainText ||
            `No message returned from ${activeWebsite?.name || "model"}`,
        };

        setMessages(updatedMessages);
      } else {
        setMsg("No active website selected.");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMsg("Error responding to your message");
      setAlertType("error");
    } finally {
      setProcessing(false);
      setProcessingIndex(null);
    }
  };

  const clearSingleChat = (id: string) => {
    const updatedWebsites = savedWebsites.filter((w: any) => w.id !== id);
    setSavedWebsites(updatedWebsites);
    localStorage.setItem("savedWebsites", JSON.stringify(updatedWebsites));
    if (activeWebsite?.id === id) {
      setActiveWebsite(null);
      setMessages([]);
      setChatId(null);
    }
  };

  const clearAllChats = () => {
    setSavedWebsites([]);
    localStorage.removeItem("savedWebsites");
    setActiveWebsite(null);
    setMessages([]);
    setChatId(null);
  };

  return (
    <div className="min-h-screen flex bg-[#1e1e20] text-white font-sans">
      {/* Sidebar */}
      <SideBar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        savedWebsites={savedWebsites}
        activeWebsite={activeWebsite}
        setActiveWebsite={(site) => {
          setActiveWebsite(site);
          setChatId(site.id);
        }}
        clearSingleChat={clearSingleChat}
        clearAllChats={clearAllChats}
      />

      {/* Main Chat UI */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!sidebarOpen && (
          <Menu
            className="absolute top-4 left-4 text-gray-300 cursor-pointer"
            onClick={toggleSidebar}
          />
        )}

        {/* Website Input */}
        <div className="w-full max-w-2xl mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter website link..."
              className="flex-1 bg-[#2a2a2e] border border-gray-700 text-white placeholder-gray-400"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveWebsite()}
            />
            <Button
              onClick={saveWebsite}
              disabled={loading}
              className="bg-blue-600 px-4 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
          {activeWebsite?.name && (
            <div className="text-sm text-gray-400 mt-2">
              Working on:{" "}
              <span className="text-blue-400">{activeWebsite?.name}</span>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold text-center mb-8">
            Speak to any website?
          </h1>

          <div className="bg-[#2a2a2e] rounded-lg p-4 h-[400px] overflow-y-auto mb-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-[70%] ${
                    msg.role === "user" ? "bg-[#1f6feb]" : "bg-[#3a3a40]"
                  }`}
                >
                  {msg.role === "model" &&
                  index === processingIndex &&
                  processing
                    ? "Responding..."
                    :<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message) }} />
                  }
                  {/* Apply stripHTML here */}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex items-center gap-2 bg-[#2a2a2e] px-4 py-3 rounded-full w-full">
            <Input
              className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-gray-400"
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-1 rounded-full"
            >
              →
            </Button>
          </div>
        </div>
      </main>
      {msg && <Alert msg={msg} setMsg={setMsg} alertType={alertType} />}
    </div>
  );
};

export default ChatApp;
