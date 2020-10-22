module.exports = {
  verbose: true,
  roots: ["<rootDir>/transforms", "<rootDir>/bin"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
};