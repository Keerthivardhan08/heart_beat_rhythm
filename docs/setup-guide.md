
# Setup guide

See the root README for commands.

## Development principles
- Use separate Python virtual environments for ML and backend if dependency needs differ.
- Pin dependencies before a release.
- Keep raw datasets and trained artifacts out of Git unless the team has explicitly approved a small, licensed file.
- Use `.env.example` as a template; never commit `.env`.
