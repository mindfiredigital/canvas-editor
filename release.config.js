const config = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/github',
      {
        assets: ['dist'],
        message:
          'chore(release): ${nextRelease.version} [skin ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/git'
  ]
}
