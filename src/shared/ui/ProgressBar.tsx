interface ProgressBarProps {
  isVisible: boolean
}

function ProgressBar({ isVisible }: ProgressBarProps) {
  return (
    <div className="progress-bar" aria-hidden={!isVisible} data-visible={isVisible}>
      <span className="progress-bar__line" />
    </div>
  )
}

export { ProgressBar }
