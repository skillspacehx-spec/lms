/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0070f3',
                    light: '#3291ff',
                    dark: '#0051a2',
                },
                secondary: {
                    DEFAULT: '#7928ca',
                    light: '#a64dff',
                },
                accent: {
                    cyan: '#50e3c2',
                    yellow: '#f5a623',
                    pink: '#ff0080',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
