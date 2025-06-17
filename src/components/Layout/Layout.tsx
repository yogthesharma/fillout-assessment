import React, { JSX } from 'react'

export interface LayoutPropsTypes {
  sidebar?: JSX.Element | string
  children: JSX.Element | string
}

const Layout = (props: LayoutPropsTypes) => {
  const { sidebar, children } = props
  return (
    <main className=''>
      <div className='flex w-full items-center justify-between'>
        {/* Left Sidebar */}
        {sidebar ? <aside className='md:max-w-sm w-sm bg-orange-300 p-4 h-screen break-words'>{sidebar}</aside> : null}

        {/* main content */}
        <div className='flex-1 p-4 flex items-start justify-center h-screen'>{children}</div>
      </div>
    </main>
  )
}

export default Layout