const config = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/git',
      {
        assets: ['dist'],
        message:
          'chore(release): ${nextRelease.version} [skin ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
}
