import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Provide the path to the messages that you're using in `AppConfig`
    createMessagesDeclaration: "./messages/en.json",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
