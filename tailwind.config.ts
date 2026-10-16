import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          dark:   '#0D1117',
          dark2:  '#161B22',
          dark3:  '#21262D',
          header: '#161B22',
          green:  '#2DD4BF',
          teal:   '#0891B2',
          bg:     '#111720',
          sent:   '#143040',
          blue:   '#60A5FA',
          sub:    '#7D8590',
          border: '#30363D',
        }
      }
    }
  },
  plugins: [],
}
export default config
