import { cn } from "@/lib/utils/classname";

type ParticipantRowProps = {
  participants: string[];
  numIcons: number;
};

export default function ParticipantRow({
  participants,
  numIcons,
}: ParticipantRowProps) {
  return (
    <div className="flex bg-inherit text-sm">
      {participants.length > 0 ? (
        participants.map((participant, index) => {
          if (index >= numIcons) {
            return null;
          } else if (index === numIcons - 1 && participants.length > numIcons) {
            const remaining = participants.length - numIcons + 1;
            return (
              <ParticipantIcon
                key="more-participants"
                iconText={`+${remaining}`}
                // juuuuuust in case (the UI would be very messed up at this point)
                isFirst={index === 0}
                label={`and ${remaining} more participant${remaining === 1 ? "" : "s"}`}
              />
            );
          }
          return (
            <ParticipantIcon
              key={participant}
              iconText={participant.charAt(0).toUpperCase()}
              isFirst={index === 0}
              label={participant}
            />
          );
        })
      ) : (
        <div className="flex h-6 items-center text-sm italic opacity-50">
          No attendees yet
        </div>
      )}
    </div>
  );
}

function ParticipantIcon({
  iconText,
  isFirst,
  label,
}: {
  iconText: string;
  isFirst: boolean;
  label: string;
}) {
  return (
    <div
      className={
        isFirst ? "mr-0.5" : "-ml-2 -mt-0.5 rounded-full bg-inherit p-0.5"
      }
    >
      <div
        className={cn(
          "bg-lion text-violet flex h-6 items-center justify-center rounded-full font-bold",
          // The "leading-[13px]" is to vertically center the text
          // By setting the line height to 1 pixel less than the font size, it should cut
          // off the descender space and properly center the numbers
          iconText.length > 1 ? "min-w-6 px-1 leading-[13px]" : "w-6",
        )}
        aria-label={label}
        role="img" // For screen readers to read the label instead of the text
      >
        {iconText.length === 1 ? (
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full fill-current"
          >
            <text
              x="51%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fontSize="60"
              fontWeight="bold"
            >
              {iconText}
            </text>
          </svg>
        ) : (
          iconText
        )}
      </div>
    </div>
  );
}
