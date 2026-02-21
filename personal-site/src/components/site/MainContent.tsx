export function MainContent() {
  return (
    <main className="content">
      <div className="name-block">
        <h1 className="name" data-text="Dusten Peterson">
          <span className="name-line">Dusten</span>
          <span className="name-line">Peterson</span>
        </h1>
      </div>

      <div className="rule" />

      <div className="meta">
        <p className="role">Building software, end to end.</p>
      </div>

      <nav className="links">
        <a href="https://www.linkedin.com/in/dustenpeterson/" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <span className="link-sep">/</span>
        <a href="https://github.com/vvdub" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <span className="link-sep">/</span>
        <a href="mailto:dustenpeterson@gmail.com">
          Mail
        </a>
      </nav>
    </main>
  )
}
