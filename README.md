# Single Page HTML Site

This project is a simple single-page application built using HTML, CSS, and JavaScript. It serves as a template for creating a basic webpage.

## Project Structure

```
single-page-html-site
├── src
│   ├── index.html       # Main HTML document
│   ├── css
│   │   └── styles.css   # Styles for the webpage
│   └── js
│       └── main.js      # JavaScript for dynamic behavior
├── dist/                # Build output directory (generated)
├── package.json         # npm configuration file
├── .gitignore           # Files to ignore in version control
└── README.md            # Project documentation
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```bash
   cd blog_page
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```
   This will create a `dist/` folder with the production-ready files.

5. **Open the `dist/index.html` file** in your web browser to view the webpage.

## Available Scripts

- `npm run build` - Builds the project by copying files from `src/` to `dist/`
- `npm run clean` - Removes the `dist/` directory
- `npm start` - Opens the HTML file directly

## CI/CD Pipeline

This project includes a Jenkins pipeline configuration that:
1. Clones the repository
2. Installs dependencies
3. Builds the SPA
4. Deploys to server

## Technologies Used

- HTML
- CSS
- JavaScript

## License

This project is licensed under the ISC License.