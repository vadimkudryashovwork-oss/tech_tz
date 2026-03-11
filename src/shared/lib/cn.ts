function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export { cn }
