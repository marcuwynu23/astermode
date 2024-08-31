# AsterMode 🌸

**AsterMode** is a lightweight JavaScript library for developers that provides a draggable "Dev Mode" indicator on your web page. The library helps to enable a development mode that overlays diagnostic tools, including hover border toggling and the ability to clear local storage directly from the page.

## Features

- **Draggable "Dev Mode" Indicator**: A movable element to indicate "Dev Mode" is active.
- **Context Menu**: Right-click or click on the indicator to access options like toggling hover borders and clearing local storage.
- **Hover Borders**: Highlight elements with a red border on hover to visualize element boundaries.
- **Dimension Tooltip**: Display the width and height of elements when hovering over them.
- **Easy Setup and Usage**: Include the library via a CDN and enable or disable with a single function call.

## Installation

You can include **AsterMode** in your project by adding the following script tag to your HTML file:

```html
<script src="https://cdn.example.com/astermode.js"></script>
```

## Usage

Once the library is included, you can enable or disable "Dev Mode" using the following JavaScript commands:

```javascript
// Enable Dev Mode
DevMode.enable();

// Disable Dev Mode
DevMode.disable();
```

Example
Here’s a simple HTML example that uses AsterMode:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>AsterMode Example</title>
		<script src="https://cdn.example.com/astermode.js"></script>
	</head>
	<body>
		<div id="root">
			<h1>Welcome to AsterMode!</h1>
			<p>Hover over elements to see their dimensions.</p>
		</div>

		<script>
			// Enable Dev Mode on page load
			DevMode.enable();
		</script>
	</body>
</html>
```

### Using AsterMode in a Vite or React App

If you're using AsterMode in a Vite or React application, you can conditionally enable "Dev Mode" based on an environment variable.

1. Set Environment Variable: Create a .env file in the root of your Vite or React project and add the following line:

For Vite:

```sh
VITE_APP_MODE=development
```

For React App:

```sh
REACT_APP_MODE=development
```

## Development

If you want to contribute to AsterMode, follow these steps to set up your development environment:

1. Clone the repository:

```sh
git clone https://github.com/yourusername/astermode.git
cd astermode
```

2. Install dependencies (if applicable):

```sh
npm install

```

3. Run a development server:

```sh
npm start

```

## Contributing

We welcome contributions! Please check out the contributing guidelines for more details.

## License

AsterMode is licensed under the MIT License. See the LICENSE file for more information.

## Acknowledgements

Inspired by the elegance and wisdom represented by the Aster flower in the language of flowers, this tool aims to bring clarity and simplicity to the development process.
