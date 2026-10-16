"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion, Transition } from "framer-motion";

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

function TypingIndicator() {
  return (
    <div className="flex h-6 items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-current opacity-60"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

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
        "bg-background relative mx-auto flex w-full max-w-2xl flex-col justify-end p-6 pb-0",
        "h-[320px] overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)]",
        className,
      )}
    >
      <div className="flex w-full flex-col justify-end gap-1 pb-4">
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
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={BOUNCY_SPRING}
                className={cn(
                  "flex w-full shrink-0 flex-col",
                  message.isMe ? "items-end" : "items-start",
                  isNewSenderGroup ? "mt-3" : "mt-0",
                )}
              >
                {showName && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-foreground/50 mb-1 ml-4 text-[11px] font-medium capitalize tracking-wide"
                  >
                    {message.sender}
                  </motion.span>
                )}

                <motion.div
                  layout
                  transition={BOUNCY_SPRING}
                  className={cn(
                    "relative flex items-center justify-center shadow-sm",
                    message.status === "typing"
                      ? "h-12 w-16 rounded-full"
                      : "h-auto max-w-[85%] px-3.5 py-2.5",
                    message.isMe
                      ? "border-foreground bg-foreground text-background"
                      : "border-lion bg-lion text-violet shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)]",

                    "rounded-3xl border-2",

                    message.status === "complete" && message.isMe && showTail
                      ? [
                          "before:bg-foreground before:absolute before:-bottom-2 before:right-1 before:h-4 before:w-4 before:rounded-bl-[16px]",
                          "after:bg-background after:absolute after:-bottom-2 after:-right-3 after:h-4 after:w-3.5 after:rounded-bl-[16px]",
                        ]
                      : "",

                    message.status === "complete" && !message.isMe && showTail
                      ? [
                          "before:bg-lion before:absolute before:-bottom-2 before:left-1 before:h-4 before:w-4 before:rounded-br-[16px]",
                          "after:bg-background after:absolute after:-bottom-2 after:-left-3 after:h-4 after:w-3.5 after:rounded-br-[16px]",
                        ]
                      : "",
                  )}
                  style={{ originX: message.isMe ? 1 : 0, originY: 1 }}
                >
                  {message.status === "typing" ? (
                    <TypingIndicator />
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="relative z-10 text-sm font-medium leading-tight sm:text-base"
                    >
                      {message.text}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
