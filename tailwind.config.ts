
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
       fontFamily: { // Add font families
         sans: ['var(--font-inter)', 'sans-serif'],
         heading: ['var(--font-manrope)', 'sans-serif'],
       },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            xl: 'calc(var(--radius) + 4px)', // Added xl for more rounded elements
            full: '9999px',
  		},
       boxShadow: { // Added custom shadows for subtle depth
         'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
         'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
         'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
         'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
         'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
         '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
         'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
         'none': 'none',
         // Custom subtle shadow from theme
         'subtle': '0 4px 8px rgba(0, 0, 0, 0.04)',
       },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
           'fadeIn': {
             'from': { opacity: '0', transform: 'translateY(5px)' }, // Slight upward movement
             'to': { opacity: '1', transform: 'translateY(0)' },
           },
           'slideInLeft': {
             'from': { transform: 'translateX(-30px)', opacity: '0' },
             'to': { transform: 'translateX(0)', opacity: '1' },
           },
           'slideInRight': {
             'from': { transform: 'translateX(30px)', opacity: '0' },
             'to': { transform: 'translateX(0)', opacity: '1' },
           },
            'popIn': { // Bouncier pop-in animation
             '0%': { transform: 'scale(0.8)', opacity: '0' },
             '50%': { transform: 'scale(1.05)', opacity: '1' },
             '100%': { transform: 'scale(1)', opacity: '1' },
           },
           'gradientBG': { // Enhanced Background gradient animation keyframe
              '0%': { 'background-position': '0% 50%, 100% 50%, center' },
              '50%': { 'background-position': '100% 50%, 0% 50%, center' },
              '100%': { 'background-position': '0% 50%, 100% 50%, center' },
            },
           'pulseGlow': { // New pulse glow keyframe
              '0%, 100%': { 'box-shadow': '0 0 5px 0px hsl(var(--primary) / 0.3)', opacity: '0.8' },
              '50%': { 'box-shadow': '0 0 15px 3px hsl(var(--primary) / 0.5)', opacity: '1' },
            },
           'float': { // New float keyframe
             '0%, 100%': { transform: 'translateY(0)' },
             '50%': { transform: 'translateY(-6px)' },
           },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
            'fade-in': 'fadeIn 0.6s ease-out forwards',
            'fade-in-delay': 'fadeIn 0.6s ease-out 0.2s forwards', // Added fade-in with delay
            'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            'pop-in': 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            'gradient-bg': 'gradientBG 25s ease infinite', // Enhanced gradient animation
            'pulse-glow': 'pulseGlow 2s infinite ease-in-out', // New pulse glow animation
            'float': 'float 3s infinite ease-in-out', // New float animation
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
