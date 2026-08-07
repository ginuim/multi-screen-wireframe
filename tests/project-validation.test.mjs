import assert from 'node:assert/strict'
import { validateProject } from '../starter/framework/lib/core/validateProject.js'

const Screen = () => null

function validProject() {
  return {
    name: 'Test',
    viewports: { mobile: { width: 375, height: 812 } },
    defaultViewport: 'mobile',
    screens: [
      {
        id: 'home',
        title: 'Home',
        component: Screen,
        entry: true,
        links: ['detail'],
        edgeCases: [],
      },
      {
        id: 'detail',
        title: 'Detail',
        component: Screen,
        links: [],
        edgeCases: [],
      },
    ],
  }
}

function rejects(change, message) {
  const project = validProject()
  change(project)
  assert.throws(() => validateProject(project), new RegExp(message))
}

validateProject(validProject())
rejects((p) => p.screens.push({ ...p.screens[0] }), 'screens\\[2\\]\\.id.*duplicate')
rejects((p) => { p.screens[0].id = 'Bad ID' }, 'screens\\[0\\]\\.id')
rejects((p) => { p.viewports = {} }, 'viewports')
rejects((p) => { p.defaultViewport = 'desktop' }, 'defaultViewport')
rejects((p) => { p.viewports.mobile.width = 0 }, 'viewports\\.mobile\\.width')
rejects((p) => { p.screens[0].component = 'Home' }, 'screens\\[0\\]\\.component')
rejects((p) => { delete p.screens[0].links }, 'screens\\[0\\]\\.links.*array')
rejects((p) => { p.screens[0].links = ['missing'] }, 'screens\\[0\\]\\.links\\[0\\].*missing')
rejects((p) => { p.screens = [] }, 'screens')

console.log('project-validation: pass')
