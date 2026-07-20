import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Preview,
  render,
  Tailwind,
  Text,
} from "react-email";

import { emailTheme } from "@/features/email/theme";

export default function renderEmail({
  previewText,
  title,
  content,
  footerText,
}: {
  previewText: string;
  title: string;
  content: React.ReactNode;
  footerText?: string;
}) {
  return render(
    <Tailwind config={emailTheme}>
      <Html>
        <Head>
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <NunitoFont
            url="https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3iazbXWjgeg.woff"
            weight={400}
          />
          <NunitoFont
            url="https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmdTQ3iazbXWjgeg.woff"
            weight={700}
          />
        </Head>
        <Preview>{previewText}</Preview>

        <Body className="bg-background text-foreground p-4">
          <Container className="bg-panel rounded-3xl p-6">
            <Text className="mt-0 text-center text-xl font-bold">{title}</Text>
            {content}
            {footerText && (
              <Text className="mb-0 text-xs opacity-50">{footerText}</Text>
            )}
          </Container>
        </Body>
      </Html>
    </Tailwind>,
  );
}

function NunitoFont({ url, weight }: { url: string; weight: number }) {
  return (
    <Font
      fontFamily="Nunito"
      fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
      webFont={{
        url,
        format: "woff",
      }}
      fontWeight={weight}
      fontStyle="normal"
    />
  );
}
