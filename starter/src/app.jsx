import { Board } from '../lib/board/Board.jsx'
import { ErrorBoundary } from '../lib/core/ErrorBoundary.jsx'
import { PrototypeProvider } from '../lib/core/PrototypeContext.jsx'
import { validateProject } from '../lib/core/validateProject.js'
import { project } from './project.js'

validateProject(project)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary scope="board">
    <PrototypeProvider project={project}>
      <Board project={project} />
    </PrototypeProvider>
  </ErrorBoundary>,
)
