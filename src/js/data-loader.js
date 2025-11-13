// Function to load and parse CSV data
async function loadMassacreData() {
    try {
        const response = await fetch('data/massacres.csv');
        const csvText = await response.text();
        
        // Parse CSV manually or use D3's built-in parser
        const data = d3.csvParse(csvText, d => ({
            name: d['Massacre Name'],
            location: d['Location (Google Maps)'],
            lat: parseFloat(d.Latitude),
            lon: parseFloat(d.Longitude),
            date: d.Date,
            governor: d['State Governor at the Time'],
            minors: parseInt(d['Minor Victims (Under 18)']) || 0,
            disappearances: parseInt(d['Enforced Dissapearances']) || 0,
            stateAction: parseInt(d['Victims of State/Police Action']) || 0,
            militia: parseInt(d['Victims of Faction/Militia Conflict']) || 0,
            police: parseInt(d['Police Officers Victims']) || 0,
            names: d.Names || '',
            notes: d.Notes || '',
            link: d['WikiFavelas Source Link'] || ''
        }));
        
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Usage in your visualization
loadMassacreData().then(data => {
    console.log('Data loaded:', data);
    createVisualizations(data);
});
