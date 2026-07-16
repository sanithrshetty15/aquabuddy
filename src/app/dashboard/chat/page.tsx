"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRobot } from '@/hooks/useRobot';
import { api } from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const BOT_RESPONSES: Record<string, string[]> = {
  humidity: [
    "Current atmospheric humidity directly affects water extraction efficiency. AquaBuddy performs optimally at 50-80% relative humidity.",
    "Humidity readings are captured every 10 seconds by the onboard DHT22 sensor. You can view historical humidity trends on the Analytics page.",
  ],
  temperature: [
    "The ambient temperature sensor monitors operating conditions. AquaBuddy's Peltier cooling system works best between 15-35°C.",
    "High temperature alerts trigger at 45°C to protect the condensation unit. You'll see these in your Alerts dashboard.",
  ],
  water: [
    "Water extraction rate depends on local humidity and ambient temperature. Under ideal conditions (70% humidity, 25°C), AquaBuddy can extract up to 25L per day.",
    "The water tank capacity is 50L. You'll receive an alert when the tank reaches 95% capacity. Check the Overview dashboard for current water levels.",
  ],
  maintenance: [
    "Regular maintenance is recommended every 90 days. You can schedule a service visit from the Booking page in your dashboard.",
    "The condensation filter should be cleaned monthly for optimal performance. The air intake filter needs replacement every 6 months.",
  ],
  alert: [
    "Active alerts are displayed on both the Overview dashboard and the dedicated Alerts page. You can acknowledge and resolve alerts directly from there.",
    "Alert thresholds are: Temperature > 45°C, Humidity < 20%, Tank > 95% capacity. Critical alerts auto-escalate to the admin team.",
  ],
  robot: [
    "Your AquaBuddy robot status is shown on the Overview page. You can manage robot settings and view telemetry from the Robot Telemetry section.",
    "To link a new robot, use the 'Link Robot' button in the sidebar. You'll need the unique 8-character activation code printed on the hardware decal.",
  ],
  help: [
    "I can help you with: water extraction stats, humidity/temperature readings, maintenance scheduling, alert management, and robot configuration. Just ask!",
    "Try asking me about: 'How much water can AquaBuddy produce?', 'What's the current humidity?', 'How do I schedule maintenance?', or 'What do my alerts mean?'",
  ],
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, responses] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  // General fallback
  const fallbacks = [
    "I'm analyzing your query against our telemetry database. Based on current system parameters, everything is operating within nominal thresholds. Could you be more specific about what you'd like to know?",
    "That's an interesting question! While I process the full analysis, you might want to check the Analytics dashboard for detailed insights. Is there something specific about humidity, temperature, or water production you'd like to explore?",
    "I appreciate the question! I'm designed to assist with AquaBuddy system diagnostics, sensor readings, maintenance scheduling, and alert management. Could you rephrase your question related to one of these areas?",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function AquaBotChat() {
  const { robots, fetchRobots, isLoading: isRobotsLoading } = useRobot();
  const [hasTelemetry, setHasTelemetry] = useState<boolean>(true);
  const [checkingTelemetry, setCheckingTelemetry] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: "Hello! I'm AquaBot, your intelligent assistant for the AquaBuddy E-Tech platform. I can help you understand sensor readings, manage alerts, schedule maintenance, and optimize water extraction. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchRobots();
  }, [fetchRobots]);

  const verifyTelemetry = async () => {
    if (isRobotsLoading) return;
    if (robots.length === 0) {
      setHasTelemetry(false);
      setCheckingTelemetry(false);
      return;
    }

    setCheckingTelemetry(true);
    try {
      // Fetch latest telemetry for the primary robot
      const response = await api.get(API_ENDPOINTS.sensors.latest(robots[0].id));
      if (response.data && response.data.data) {
        setHasTelemetry(true);
      } else {
        setHasTelemetry(false);
      }
    } catch (err) {
      setHasTelemetry(false);
    } finally {
      setCheckingTelemetry(false);
    }
  };

  useEffect(() => {
    void verifyTelemetry();
  }, [robots, isRobotsLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: getBotResponse(userMsg.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-[calc(100vh-80px)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">AquaBot AI</h2>
          <p className="text-foreground/60 font-light text-sm">Direct interface with system intelligence and diagnostics.</p>
        </div>
        <button
          onClick={() => void verifyTelemetry()}
          disabled={checkingTelemetry}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondaryBg border border-black/10 dark:border-white/10 rounded-xl text-xs text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingTelemetry ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Warning Banner if telemetry data does not exist */}
      {!checkingTelemetry && !hasTelemetry && (
        <div className="mb-6 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Sensor Telemetry Disconnected</h4>
            <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
              No telemetry data is currently available for your AquaBuddy unit. AquaBot AI requires live sensor metrics to run diagnostic analyses. Please verify your robot is powered on and connected to local MQTT, or contact support if this issue persists.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden min-h-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3 bg-background/25 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">AquaBot AI</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${hasTelemetry && !checkingTelemetry ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className={`text-[10px] ${hasTelemetry && !checkingTelemetry ? 'text-emerald-400' : 'text-amber-400'} font-medium`}>
                {checkingTelemetry ? 'Checking Status...' : hasTelemetry ? 'Online & Synced' : 'Telemetry Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-0 bg-background/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3.5 text-sm font-light leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/15 border border-accent/20 text-foreground rounded-2xl rounded-br-sm'
                  : 'bg-secondaryBg border border-black/5 dark:border-white/5 text-foreground/80 rounded-2xl rounded-bl-sm'
              }`}>
                {msg.content}
                <p className="text-[9px] text-foreground/40 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl rounded-bl-sm px-5 py-3.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-xs text-foreground/50">AquaBot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-background/10 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={hasTelemetry ? "Ask AquaBot anything about your system..." : "Telemetry offline. Ask AquaBot general questions..."}
              className="w-full bg-background border border-black/10 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-foreground/30 pr-14"
            />
            <button onClick={handleSend} disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent/10 hover:bg-accent/20 rounded-xl transition-colors text-accent disabled:opacity-30 cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-foreground/40 mt-2 text-center">AquaBot uses rule-based responses. Try asking about humidity, temperature, water, maintenance, or alerts.</p>
        </div>
      </div>
    </div>
  );
}
