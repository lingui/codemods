module.exports = {
  verbose: true,
  roots: ["<rootDir>/transforms", "<rootDir>/bin"],
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.spec.json",
      },
    ],
  },
};
