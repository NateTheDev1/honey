/**
 * This is an example of a honey application in practice.
 */

// index.tsx
import honey from 'honey'
import { App } from './app'

const root: HoneyRoot = honey.init('app')

root.render(<App />)

// app.tsx
import honey from 'honey'

const App = (props) =>
  honey.page('/', (controller) => {

    controller.on('mount', () => {
      console.log('mounted')
    })  

    controller.on('unmount', () => {
      console.log('unmounted')
    })

    return (
      <div >
        <h1>Hello World!</h1>
      </div>
    )
    // HoneyPageConfig? optional
  }, {} as HoneyPageConfig)
