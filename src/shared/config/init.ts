import { createEvent } from 'effector'

const appStartedFn = createEvent<void>()

export { appStartedFn }
