import { useState } from 'react'
import PageLinks from './PageLinks'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PageLinks />
    </>
  )
}

export default App
