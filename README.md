# popshop\*

## What's inside?

This monorepo includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app
- `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `protocol`: contains the smart contracts and the logic for the protocol

Each package/app is in [TypeScript](https://www.typescriptlang.org/). Contracts are written in [Solidity](https://docs.soliditylang.org/en/v0.8.18/).

### Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [shadcn/ui](https://ui.shadcn.com/) and [Radix](https://www.radix-ui.com/) for customizable UI components
- [NextAuth](https://next-auth.js.org/) for user authentication
- [Privy](https://www.privy.io/) for wallet connection

## Development

### Web App Setup

To run the web app, you will need to copy the `packages/web/.env.template` file to `packages/web/.env` in order for the app to have the necessary environment variables to run.

```bash
cp packages/web/.env.template packages/web/.env
```

### Build

To build all apps and packages, run the following command:

```bash
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```bash
yarn run dev
```
