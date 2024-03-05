import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout flex flex-col h-full">
      <header className='h-16 min-h-16 flex justify-center items-center'>
        <div className="container flex justify-between">
          <div>
            IELTS
          </div>
          <nav>
            <ul className='flex gap-4'>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/chapters">Chapters</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className='flex-1'>{children}</main>
      <footer className='h-16 min-h-16 flex justify-center items-center'>
        <p className='text-center'>
          Powered by Yunxiang Gu 2024
        </p>
      </footer>
    </div>
  )
}

export default Layout;