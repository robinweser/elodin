import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react'

const TabNavContext = createContext({})

function TabNav({ duration = 150, children }) {
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
    duration,
  }

  return (
    <TabNavContext.Provider value={context}>
      <div
        dir="rtl"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'scroll',
        }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>{children}</div>
        <TabNavItemBorder />
      </div>
    </TabNavContext.Provider>
  )
}

function getOffset(element, dir) {
  if (dir === 'rtl') {
    return window.innerWidth - element.offsetLeft - element.offsetWidth
  }

  return element.offsetLeft
}

function TabNavItem({ children, isActive }) {
  const {
    activeTab,
    duration,
    setActiveTab,
    setBorderWidth,
    setBorderLeft,
  } = useContext(TabNavContext)
  const itemRef = useRef()
  const dir = 'rtl'

  function activateTab() {
    const currentBorderWidth = (activeTab && activeTab.offsetWidth) || 0
    const currentBorderLeft = (activeTab && getOffset(activeTab, dir)) || 0

    const newBorderWidth = itemRef.current.offsetWidth
    const newBorderLeft = getOffset(itemRef.current, dir)

    // TODO: do RTL support
    const toRight = newBorderLeft >= currentBorderLeft

    if (dir === 'rtl' ? !toRight : toRight) {
      setBorderWidth(
        currentBorderWidth +
          newBorderWidth +
          (newBorderLeft - currentBorderLeft - currentBorderWidth)
      )

      setTimeout(() => {
        setBorderWidth(newBorderWidth)
        setBorderLeft(newBorderLeft)
      }, duration)
    } else {
      setBorderWidth(
        currentBorderWidth +
          newBorderWidth +
          (currentBorderLeft - newBorderLeft - newBorderWidth)
      )
      setBorderLeft(newBorderLeft)

      setTimeout(() => {
        setBorderWidth(newBorderWidth)
      }, duration)
    }

    setActiveTab(itemRef.current)
  }

  useEffect(() => {
    if (isActive) {
      setActiveTab(itemRef.current)
      setBorderWidth(itemRef.current.offsetWidth)
      setBorderLeft(getOffset(itemRef.current, dir))
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
        transitionProperty: 'color',
        transitionTimingFunction: 'ease-out',
        transitionDuration: duration + 'ms',
        color: activeTab && activeTab === itemRef.current ? 'blue' : 'black',
      }}>
      {children}
    </div>
  )
}

function TabNavItemBorder({ children }) {
  const { activeTab, duration, borderWidth, borderLeft } = useContext(
    TabNavContext
  )

  return (
    <span
      id="border"
      style={{
        height: 3,
        right: borderLeft,
        width: borderWidth,
        position: 'relative',
        backgroundColor: 'blue',
        alignSelf: 'flex-start',
        overflow: 'hidden',
        transitionProperty: 'all',
        transitionTimingFunction: 'ease-out',
        transitionDuration: duration + 'ms',
      }}
    />
  )
}

export default () => (
  <TabNav>
    <TabNavItem isActive>Hello</TabNavItem>
    <TabNavItem>World</TabNavItem>
    <TabNavItem>Baz</TabNavItem>
    <TabNavItem>Super Huge Very Long Tab</TabNavItem>
    <TabNavItem>FooBar</TabNavItem>
  </TabNav>
)
