# Work log - where we keep track of what we've done

## Vite Scaffolding
- **Scaffolded project with Vite**: Converted from standalone React component to full Vite project
- **Created project structure**: 
  - `src/` directory with proper React entry points
  - `src/components/ui/` for reusable UI components
  - `src/App.jsx` moved from root `app.js`
- **Added build tooling**:
  - Vite configuration with React plugin
  - Tailwind CSS setup with PostCSS
  - ESLint configuration for React
  - Path aliases (`@/` → `src/`)
- **Created UI components**:
  - `Card` and `CardContent` components
  - `Button` component with proper styling
- **Added dependencies**:
  - React 18, React DOM
  - Framer Motion for animations
  - React Confetti for celebration effects
  - Tailwind CSS, PostCSS, Autoprefixer
  - ESLint and related plugins
- **Development server**: Running on http://localhost:5173/

## Added Cursor Rules
- **Created `.cursorrules` file**: Added project-specific rules for Cursor AI
- **Work log rule**: Enforced requirement to write to `WORK_LOG.md` after any changes
- **Code style guidelines**: Added rules for consistent formatting and React best practices
- **Project structure rules**: Defined organization for components and imports

## Updated Work Log Format
- **Removed dates**: Simplified format to just show newest entries at the bottom
- **Cleaner structure**: Easier to read and maintain

## UI Improvements
- **Fixed round title text color**: Changed "Round 1: Do you ENJOY this skill?" and "Round 2: Are you GOOD at this skill?" text from white to black by adding `text-black` class to the h1 element in `src/App.jsx`

## CSS Fixes
- **Removed default text color from :root**: Deleted the `color` property from the `:root` selector in `src/index.css` to allow Tailwind's text color utilities to work as expected throughout the app.
- **Fixed React hook order error in SkillSorter**:
  - Moved useWindowSize hook to always be called at the top level of the SkillSorter component in src/App.jsx
  - Now only uses window size values conditionally, preventing violation of the Rules of Hooks
  - This resolves the 'Rendered more hooks than during the previous render' error after answering all cards

## Card Centering Fix
- Fixed the falling card's horizontal alignment so it now appears perfectly centered on the screen
- Updated the motion.div in `src/App.jsx` to use `left: 50%` and `transform: translateX(-50%)` for true centering

## Card Centering Fix (Follow-up)
- Removed the inline `style={{ transform: 'translateX(-50%)' }}` from the card's motion.div in `src/App.jsx`
- Now only using Tailwind's `-translate-x-1/2` class for centering, allowing Framer Motion's `x` animation to work correctly

## Card Centering Fix (True Middle)
- Updated the card's motion.div in `src/App.jsx` so the initial x position is 0 (true center)
- Now the random offsetX is only applied in the animate prop when the card is falling, ensuring it falls from the true middle and lands with horizontal variation

## Card Centering Fix (Framer Motion Only)
- Switched to using only Framer Motion for horizontal centering and offset of the card in `src/App.jsx`
- Removed `-translate-x-1/2` from the className and used `x: '-50%'` in initial and `x: calc(${offsetX}px - 50%)` in animate for the falling state
- This avoids transform order conflicts and ensures the card falls from the true center

## Favicon Setup
- Created `public/` directory for static assets
- Added custom SVG favicon (`public/favicon.svg`) with modern blue gradient design
- Updated `index.html` to reference `/favicon.svg` instead of non-existent `/vite.svg`
- Favicon features layered geometric shapes representing skill organization concept