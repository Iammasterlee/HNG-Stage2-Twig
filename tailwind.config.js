/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.twig"],
  theme: {
    extend: {
       colors: {
        'status-open': '#10B981',       // green
        'status-in-progress': '#F59E0B',// amber
        'status-closed': '#6B7280'      // gray
      }
    },
  },
  plugins: [],
}

