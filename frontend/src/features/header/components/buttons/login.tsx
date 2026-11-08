import LinkButton from "@/features/button/components/link";

export default function LoginButton() {
  return (
    <LinkButton
      className="relative z-10"
      buttonStyle="frosted glass inset"
      label="Log In"
      href="/login"
    />
  );
}
