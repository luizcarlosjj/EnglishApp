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
          dark:   '#111B21',
          dark2:  '#1F2C34',
          dark3:  '#2A3942',
          header: '#075E54',
          green:  '#25D366',
          teal:   '#128C7E',
          bg:     '#ECE5DD',
          sent:   '#DCF8C6',
          blue:   '#53BDEB',
          sub:    '#667781',
          border: '#e9edef',
        }
      }
    }
  },
  plugins: [],
}
export default config
