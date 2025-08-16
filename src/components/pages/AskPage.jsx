import React from "react";
import ChatInterface from "@/components/organisms/ChatInterface";

const AskPage = () => {
  return (
    <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Ask Coach IanB
        </h1>
        <p className="text-gray-600">
          Get insights on leadership, family business, coaching, and faith-based guidance from Coach IanB's knowledge base.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full p-6">
        <ChatInterface />
      </div>
    </div>
  );
};

export default AskPage;