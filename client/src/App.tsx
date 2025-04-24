import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Search, Mic, Waves, Menu, X } from "lucide-react";
import { CreateXavia, TalkToXavia, GetChatHistory } from "./function";
import Alert from "./components/ui/alert";

const ChatApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [websiteInput, setWebsiteInput] = useState("");
  const [savedWebsites, setSavedWebsites] = useState<string[]>([]);
  const [activeWebsite, setActiveWebsite] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null); // Store chat ID

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    // Send message to Xavia if a website is active
    if (activeWebsite && chatId) {
      try {
        const response = await TalkToXavia(chatId, input);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "bot",
            content: response.data || `Response from ${activeWebsite}`,
          },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const saveWebsite = async () => {
    if (!websiteInput.trim()) {
      setMsg("Choose a website or enter a new website URL");
      setAlertType("error");
      return;
    }

    setLoading(true);
    try {
      const response = await CreateXavia(websiteInput);
      console.log({ response });
      
      const updated = Array.from(new Set([...savedWebsites, websiteInput]));
      setSavedWebsites(updated);
      setActiveWebsite(websiteInput);
      setWebsiteInput("");
      setChatId(response.chatId); // Set chat ID after creating Xavia
      setMsg("Website saved successfully.");
      setAlertType("success");
    } catch (error) {
      console.log("Error saving website: ", error);
      setMsg("Something went wrong while saving this website.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    if (chatId) {
      try {
        const history = await GetChatHistory(chatId);
        setMessages(history.data || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    }
  };

  useEffect(() => {
    if (chatId) {
      loadChatHistory();
    }
  }, [chatId]);

  return (
    <div className="min-h-screen flex bg-[#1e1e20] text-white font-sans">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-[260px]" : "w-0"
        } bg-[#121212] p-4 overflow-hidden border-r border-gray-700`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">XAVIA</h2>
          <X
            className="cursor-pointer text-gray-400 hover:text-white"
            onClick={toggleSidebar}
          />
        </div>

        <div className="mb-3 text-sm text-gray-300">Saved Websites</div>
        <div className="flex flex-col gap-2 text-sm">
          {savedWebsites.map((site, i) => (
            <button
              key={i}
              onClick={() => setActiveWebsite(site)}
              className={`text-left px-3 py-2 rounded ${
                site === activeWebsite
                  ? "bg-[#1f6feb] text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              {site}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat UI */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Toggle Menu Button */}
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
          {activeWebsite && (
            <div className="text-sm text-gray-400 mt-2">
              Working on: <span className="text-blue-400">{activeWebsite}</span>
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
                  {msg.content}
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
            <div className="flex items-center gap-2">
              <Button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-1 rounded-full"
              >
                →
              </Button>
            </div>
          </div>
        </div>
      </main>
      {msg && <Alert msg={msg} setMsg={setMsg} alertType={alertType} />}
    </div>
  );
};

export default ChatApp;
