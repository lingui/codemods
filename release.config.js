module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: true,
        pkgRoot: ".",
      },
    ],
    {
      assets: ["package.json", "CHANGELOG.md"],
      message:
        "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      path: "@semantic-release/git",
    },
    "@semantic-release/github",
  ],
};
