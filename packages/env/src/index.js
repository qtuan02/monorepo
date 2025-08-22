"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
/* eslint-disable turbo/no-undeclared-env-vars */
const env_nextjs_1 = require("@t3-oss/env-nextjs");
const zod_1 = require("zod");
const env = (0, env_nextjs_1.createEnv)({
    server: {},
    client: {
        NEXT_PUBLIC_ENV: zod_1.z.string().optional(),
        NEXT_PUBLIC_PORTFOLIO_DOMAIN: zod_1.z.string().url(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
        NEXT_PUBLIC_PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN,
    },
});
exports.env = env;
