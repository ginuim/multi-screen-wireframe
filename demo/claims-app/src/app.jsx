import { Board } from '../../../starter/lib/board/Board.jsx'
import { ErrorBoundary } from '../../../starter/lib/core/ErrorBoundary.jsx'
import { PrototypeProvider } from '../../../starter/lib/core/PrototypeContext.jsx'
import { validateProject } from '../../../starter/lib/core/validateProject.js'
import { project } from './project.js'

validateProject(project)

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary scope="board">
    <PrototypeProvider project={project}>
      <Board project={project} />
    </PrototypeProvider>
  </ErrorBoundary>,
)
