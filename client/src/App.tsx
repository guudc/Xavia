import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Search, Mic, Waves, Menu, X } from "lucide-react";
import { CreateXavia, TalkToXavia, GetChatHistory } from "./function";
import Alert from "./components/ui/alert";
import SideBar from "./components/SideBar";

const ChatApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [websiteInput, setWebsiteInput] = useState("");
  const [savedWebsites, setSavedWebsites] = useState<string[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<any>({});
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessageIndex = messages.length;
    setProcessingIndex(newMessageIndex + 1);
    setProcessing(true);

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    if (activeWebsite && activeWebsite.id) {
      try {
        const response = await TalkToXavia(
          activeWebsite.id,
          input
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "bot",
            content:
              response.message || `Response from ${activeWebsite?.error}`,
          },
        ]);
      } catch (error) {
        setMsg("Error responding to your message");
        setAlertType("error");
        console.error("Error sending message:", error);
      } finally {
        setProcessing(false);
        setProcessingIndex(null); // Reset after processing
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

      const updated = Array.from(new Set([...savedWebsites, websiteInput]));
      setSavedWebsites(updated);
      setActiveWebsite(response);
      setWebsiteInput("");
      setChatId(response.id); // Set chat ID after creating Xavia
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

      <SideBar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        savedWebsites={savedWebsites}
        activeWebsite={activeWebsite}
        setActiveWebsite={setActiveWebsite}
      />

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
                  {msg.role === "bot" && index === processingIndex && processing
                    ? "Responding..."
                    : msg.content}
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
