# AWSM JSON Viewer

An awsm json viwer featuring JSON extraction, tree view, raw view, search capabilities, and a modern UI using shadcn/ui components.

## Features

- **JSON Extraction**: Automatically extracts valid JSON from text that may contain other content.
- **Tree View**: Interactive collapsible tree representation of JSON data.
- **Raw View**: Displays the JSON in its raw, formatted string form.
- **Search Functionality**: Search through JSON keys and values with highlighting.
- **Copy to Clipboard**: Easily copy the parsed JSON.
- **Theme Support**: Light and dark mode toggle.
- **Responsive Design**: Works on desktop and mobile devices.
- **Security**: Includes Content Security Policy and other security headers.

## looks :
<img width="1719" height="962" alt="awsmjson netlify app-SecureJSONViewer" src="https://github.com/user-attachments/assets/4b9bb194-8014-43f2-9bf0-e10cb3d9fa2e" />
<img width="1719" height="962" alt="awsmjson netlify app-SecureJSONViewer(1)" src="https://github.com/user-attachments/assets/4af7de9d-d604-4dd4-a41f-048a3a310fd4" />



## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/json_viewer.git
   cd json_viewer
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start # start production server
```

## Key Components

- [`JsonMain`](components/json-main.tsx): Main component managing state and layout.
- [`JsonViewer`](components/json-viewer.tsx): Handles view modes (tree/raw) and rendering.
- [`JsonTree`](components/json-tree.tsx): Recursive component for tree view rendering.
- [`JsonInput`](components/json-input.tsx): Textarea for JSON input with error handling.
- [`Footer`](components/footer.tsx): Footer with controls for view mode, search, and theme.

## Usage

1. Paste your JSON or text containing JSON into the left panel.
2. The app will automatically parse and display the JSON in the right panel.
3. Switch between Tree View and Raw View using the tabs.
4. Use the search bar to highlight matching keys/values.
5. Click "Copy" to copy the formatted JSON to clipboard.
6. Toggle between light and dark themes.

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation.
- **React**: UI library for building components.
- **TypeScript**: Typed JavaScript for better development experience.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Modern UI components built on Radix UI.
- **Lucide React**: Icon library.
- **react-resizable-panels**: For resizable panels.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.


# does not add any value ?, maybe not for you, but it was my second project in my journy.