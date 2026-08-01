import Tooltip from "@/features/system-feedback/tooltip/base";
import { cn } from "@/lib/utils/classname";

type ParticipantRowProps = {
  participants: string[];
  numIcons: number;
};

export default function ParticipantRow({
  participants,
  numIcons,
}: ParticipantRowProps) {
  let rowContent = (
    <div
      className={cn(
        "flex w-fit bg-inherit text-sm",
        // Every icon after the first has padding meant to act as a border
        Math.min(numIcons, participants.length) > 1 && "-mb-0.5",
      )}
    >
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

  if (participants.length > 0) {
    rowContent = (
      <Tooltip
        content={<TooltipContent participants={participants} />}
        maxHeight="384px"
      >
        {rowContent}
      </Tooltip>
    );
  }

  return rowContent;
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

function TooltipContent({ participants }: { participants: string[] }) {
  return (
    <div className="flex flex-col">
      <div className="text-center font-bold">
        {participants.length} Attendee{participants.length !== 1 ? "s" : ""}
      </div>
      <ul>
        {participants.map((participant) => (
          <li
            key={participant}
            className="whitespace-nowrap text-center text-sm"
          >
            {participant}
          </li>
        ))}
      </ul>
    </div>
  );
}
