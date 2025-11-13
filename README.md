# Rio de Janeiro Massacres - Interactive Data Visualization

Interactive D3.js visualizations exploring documented massacres in Rio de Janeiro from 1990-2025.

## Features

- **Geographic Map Visualization**: Hover over regions to view massacre details, victim types, and source links
- **Victims Timeline Chart**: Stacked bar chart showing victim counts by massacre, grouped by state governor with scroll and zoom capabilities

## Data

The dataset includes 47 documented massacres with:
- Location (geocoded coordinates)
- Date and state governor at the time
- Victim categories: minor victims, enforced disappearances, state/police action, militia conflict
- Victim names and notes

## Technologies

- D3.js v7
- HTML5
- CSS3
- TopoJSON (for map data)

## Setup & Running

1. Clone the repository
2. Install dependencies: `npm install`
3. Start local server: `npm start`
4. Open http://localhost:8000 in your browser

## Files

- `index.html` - Main page with both visualizations
- `src/js/map-visualization.js` - Geographic map component
- `src/js/chart-visualization.js` - Timeline chart component
- `data/massacres.csv` - Source data
- `src/css/styles.css` - Styling

## Data Sources

- WikiFavelas
- Government records
- News archives
- Civil society organizations

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome. Please open an issue or submit a pull request.
