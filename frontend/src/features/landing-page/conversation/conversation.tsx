"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, Transition } from "framer-motion";

import MessageBubble from "@/features/landing-page/conversation/message-bubble";
import { cn } from "@/lib/utils/classname";

interface Message {
  id: string;
  sender: "lucy" | "charlie" | "marcie" | "linus";
  text: string;
  isMe: boolean;
  status: "typing" | "complete";
}

const LOOP_SCRIPT = [
  { sender: "lucy", isMe: true, text: "Are you free this Monday at 2 PM?" },
  { sender: "linus", isMe: false, text: "No, how about Tuesday at 10 AM?" },
  {
    sender: "marcie",
    isMe: false,
    text: "I can't do Tuesday. Are you free Wednesday at 4 PM?",
  },
  { sender: "charlie", isMe: false, text: "No, how about Thursday at 1 PM?" },
  {
    sender: "lucy",
    isMe: true,
    text: "I'm busy then. Are you free Friday at 5 PM?",
  },
  { sender: "linus", isMe: false, text: "No, how about Saturday at 11 AM?" },
  {
    sender: "marcie",
    isMe: false,
    text: "Can't do the weekend. Are you free Monday at 9 AM?",
  },
  { sender: "charlie", isMe: false, text: "No, how about Monday at 3 PM?" },
] as const;

const BOUNCY_SPRING: Transition = {
  type: "spring",
  damping: 15,
  stiffness: 140,
  mass: 0.9,
};

export default function ConversationAnimation({
  className,
}: {
  className?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let isMounted = true;
    setMessages([]);

    const runAnimation = async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      // initial delay before starting the animation
      await sleep(600);

      let iteration = 0;

      while (isMounted) {
        const template = LOOP_SCRIPT[iteration % LOOP_SCRIPT.length];
        const newMsg: Message = {
          ...template,
          id: `msg-${iteration}`,
          status: "typing",
        };

        setMessages((prev) => {
          const next = [...prev, newMsg];
          return next.slice(-12);
        });

        // typing indicator duration
        await sleep(1000);

        if (!isMounted) return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.id ? { ...m, status: "complete" } : m,
          ),
        );

        // pause before next message
        await sleep(1000);

        iteration++;
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={cn(
        "bg-background relative mx-auto w-full max-w-2xl",
        "h-[320px] overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)]",
        "[overflow-anchor:none]",
        className,
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 flex w-full flex-col justify-end gap-1 px-6 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index, array) => {
            const prev = array[index - 1];
            const next = array[index + 1];

            const isFirstInSequence = !prev || prev.sender !== message.sender;
            const isLastInSequence = !next || next.sender !== message.sender;

            const showName =
              !message.isMe &&
              isFirstInSequence &&
              message.status === "complete";
            const showTail = isLastInSequence || message.status === "typing";
            const isNewSenderGroup = isFirstInSequence && index !== 0;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                showName={showName}
                showTail={showTail}
                isNewSenderGroup={isNewSenderGroup}
                springConfig={BOUNCY_SPRING}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
