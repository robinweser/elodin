import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react'

const TabNavContext = createContext({})

function TabNav({ children }) {
  const [activeTab, setActiveTab] = useState(undefined)
  const [borderWidth, setBorderWidth] = useState(0)
  const [borderLeft, setBorderLeft] = useState(0)

  const context = {
    activeTab,
    setActiveTab,
    borderWidth,
    setBorderWidth,
    borderLeft,
    setBorderLeft,
  }

  return (
    <TabNavContext.Provider value={context}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </TabNavContext.Provider>
  )
}

function TabNavItem({ children, isActive }) {
  const {
    activeTab,
    borderWidth,
    borderLeft,
    setActiveTab,
    setBorderWidth,
    setBorderLeft,
  } = useContext(TabNavContext)
  const itemRef = useRef()

  function activateTab() {
    const currentBorderWidth = (activeTab && activeTab.offsetWidth) || 0
    const currentBorderLeft = (activeTab && activeTab.offsetLeft) || 0

    const newBorderWidth = itemRef.current.offsetWidth
    const newBorderLeft = itemRef.current.offsetLeft

    const toRight = newBorderLeft >= currentBorderLeft

    if (toRight) {
      setBorderWidth(
        currentBorderWidth +
          newBorderWidth +
          (newBorderLeft - currentBorderLeft - currentBorderWidth)
      )

      setTimeout(() => {
        setBorderWidth(newBorderWidth)
        setBorderLeft(newBorderLeft)
      }, 500)
    } else {
      setBorderWidth(
        currentBorderWidth +
          newBorderWidth +
          (currentBorderLeft - newBorderLeft - newBorderWidth)
      )
      setBorderLeft(newBorderLeft)

      setTimeout(() => {
        setBorderWidth(newBorderWidth)
      }, 500)
    }

    setActiveTab(itemRef.current)
  }

  useEffect(() => {
    if (isActive) {
      setActiveTab(itemRef.current)
      setBorderWidth(itemRef.current.offsetWidth)
      setBorderLeft(itemRef.current.offsetLeft)
    }
  }, [])

  return (
    <div
      ref={itemRef}
      id={children}
      onClick={activateTab}
      style={{
        padding: 20,
        border: '1px solid lightgrey',
        transition: 'color 500ms ease-out',
        color: activeTab && activeTab === itemRef.current ? 'blue' : 'black',
      }}>
      {children}
    </div>
  )
}

function TabNavItemBorder({ children }) {
  const { activeTab, borderWidth, borderLeft } = useContext(TabNavContext)

  return (
    <span
      id="border"
      style={{
        height: 3,
        left: borderLeft,
        position: 'relative',
        width: borderWidth,
        backgroundColor: 'blue',
        alignSelf: 'flex-start',
        overflow: 'hidden',
        transition: 'all 500ms ease-out',
      }}
    />
  )
}

export default () => (
  <TabNav>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <TabNavItem isActive>Hello</TabNavItem>
      <TabNavItem>World</TabNavItem>
      <TabNavItem>Super Huge Very Long Tab</TabNavItem>
      <TabNavItem>FooBar</TabNavItem>
    </div>
    <TabNavItemBorder />
  </TabNav>
)
