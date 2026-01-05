import { useState } from 'react'
import PageLinks from './PageLinks'
import { Toaster } from './Components/ui/toaster'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PageLinks />
      <Toaster />
    </>
  )
}

export default App
