"use client";

import dynamic from "next/dynamic";

const SmartTourChatbot = dynamic(() => import("@/components/SmartTourChatbot"), {
  ssr: false,
});

export default function Chatbot() {
  return <SmartTourChatbot />;
}
