import { Board } from '../framework/lib/board/Board.jsx'
import { ErrorBoundary } from '../framework/lib/core/ErrorBoundary.jsx'
import { PrototypeProvider } from '../framework/lib/core/PrototypeContext.jsx'
import { validateProject } from '../framework/lib/core/validateProject.js'
import { project } from './project.js'

validateProject(project)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary scope="board">
    <PrototypeProvider project={project}>
      <Board project={project} />
    </PrototypeProvider>
  </ErrorBoundary>,
)
