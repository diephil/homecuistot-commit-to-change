import { Text } from "./Text";

export function Footer() {
  return (
    <footer className="py-6 md:py-8 bg-black text-white border-t-4 md:border-t-6 border-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center">
          <Text as="p" className="font-black text-base md:text-lg">
            Made with ❤️ for Commit To Change 2026 by Encode Club & Comet Opik
          </Text>
        </div>
      </div>
    </footer>
  );
}
