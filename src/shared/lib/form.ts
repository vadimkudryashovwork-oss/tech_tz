function onSubmit(submit: () => void) {
  return (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }
}

function getTargetValue<T>(handler: (val: T) => void) {
  return (e: { target: { value: T } }) => handler(e.target.value)
}

export { getTargetValue, onSubmit }
