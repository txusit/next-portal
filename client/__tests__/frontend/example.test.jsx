import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect' // Import extend-expect for additional matchers
import Example from '@/components/exampleComponent'

describe('Home', () => {
  it('renders a heading', () => {
    render(<Example />)

    const heading = screen.getByRole('heading', {
      name: 'welcome to next.js',
    })

    expect(heading).toBeInTheDocument()
  })
})
