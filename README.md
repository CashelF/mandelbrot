# Mandelbrot Set Viewer

This project provides a simple and interactive visualization of the Mandelbrot set, utilizing WebGL for rendering. Users can zoom and pan to explore different parts of the Mandelbrot set and adjust the color settings to enhance the visual experience.

## Features

- **Zooming**: Mouse wheel/trackpad two-finger drag to zoom in and out.
- **Panning**: Click and drag to move around the set.
- **Color Adjustment**: Use the color pickers to customize the colors.
- **Resolution Adjustment**: Change the number of iterations for finer or coarser detail.
- **Settings Toggle**: Click the settings button to open the settings panel and customize the view. The settings panel automatically collapses when you interact with the Mandelbrot set.

## Technology

The Mandelbrot Set Viewer is implemented using plain HTML and JavaScript with WebGL for efficient graphical computations and rendering.

## Setup

To run this project locally, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/CashelF/mandelbrot.git
```
2. Open `index.html` in your web browser.

Alternatively, visit https://cashel.dev/mandelbrot/ to view the project live.

## Usage

Upon loading the viewer, you will see the Mandelbrot set rendered in the browser. Use your mouse to interact:

- **Zoom**: Scroll the mouse wheel/two-finger drag the trackpad up to zoom in and down to zoom out.
- **Pan**: Click and hold the left mouse button and move the mouse to pan around the set.
- **Change Colors**: Click the settings button (⚙️) to open the settings panel. Use the color pickers to adjust the RGB values for customizing the colors.
- **Adjust Resolution**: Move the resolution slider in the settings panel to increase or decrease the number of iterations.
- **Close Settings Panel**: The settings panel automatically collapses when you interact with the Mandelbrot set (zoom, pan, etc.).

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests with your proposed changes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the [MIT License](LICENSE).
