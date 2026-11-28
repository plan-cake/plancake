import { ButtonArray } from "@/features/button/button-array";

type MessagePageProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  buttons: ButtonArray;
};

export default function MessagePage({
  title,
  description,
  children,
  buttons,
}: MessagePageProps) {
  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="-mb-2 text-3xl font-bold">{title}</h2>
      {description && <p>{description}</p>}
      {children}
      <div className="flex justify-center gap-4">
        {buttons.map((button, index) => (
          <div key={index}>{button}</div>
        ))}
      </div>
    </div>
  );
}
