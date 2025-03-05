set dotenv-load

export EDITOR := 'nvim'

default:
  just --list

fmt:
  prettier --write .

dev:
  bun run dev
