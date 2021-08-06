const log = (...arguments_) => {
  console.log(...arguments_)
}
const error = (...arguments_) => {
  console.error(...arguments_)
}

const Logger = {
  error,
  log,
}

export default Logger