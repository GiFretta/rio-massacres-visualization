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



function createMap(data) {
    const container = d3.select("#map-container");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Your projection for Rio
    const projection = d3.geoMercator()
        .center([-43.2, -22.9])
        .scale(150000)
        .translate([width / 2, height / 2]);

    // Bind data and create circles
    svg.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", d => Math.sqrt((d.stateAction + d.militia + d.disappearances) / Math.PI) * 3 + 5)
        .attr("fill", d => d.stateAction > d.militia ? "#e74c3c" : "#f39c12")
        .attr("opacity", 0.7);
}


function createTimelineChart(data) {
    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = d3.select("#chart-container");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    const margin = { top: 20, right: 30, bottom: 150, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(data.map((d, i) => i))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.stateAction + d.militia + d.police + d.disappearances)])
        .range([innerHeight, 0]);

    // Create stacked bars
    data.forEach((d, i) => {
        const categories = [
            { key: 'stateAction', color: '#e74c3c' },
            { key: 'militia', color: '#f39c12' },
            { key: 'police', color: '#27ae60' },
            { key: 'disappearances', color: '#9b59b6' }
        ];

        let yOffset = 0;
        categories.forEach(cat => {
            const barHeight = yScale(0) - yScale(d[cat.key]);
            
            g.append("rect")
                .attr("x", xScale(i))
                .attr("y", yScale(yOffset + d[cat.key]))
                .attr("width", xScale.bandwidth())
                .attr("height", barHeight)
                .attr("fill", cat.color)
                .on("mouseover", function(event) {
                    showDetailedTooltip(event, d, cat.key);
                });
            
            yOffset += d[cat.key];
        });
    });

    // Add axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickValues([]))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append("g").call(d3.axisLeft(yScale));

    // Add labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 120)
        .style("text-anchor", "middle")
        .text("Massacres by Date and Governor");
}


function showDetailedTooltip(event, d, category) {
    const categoryNames = {
        stateAction: 'State/Police Action',
        militia: 'Faction/Militia Conflict',
        police: 'Police Officers',
        disappearances: 'Enforced Disappearances'
    };

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");

    tooltip.append("strong").text(d.name);
    tooltip.append("div").text(`📅 ${formatDate(d.date)}`);
    tooltip.append("div").text(`👤 Governor: ${d.governor}`);
    tooltip.append("div").text(`${categoryNames[category]}: ${d[category]} victims`);
    if (d.minors > 0) tooltip.append("div").text(`👶 Minor victims: ${d.minors}`);
    if (d.link) {
        tooltip.append("a")
            .attr("href", d.link)
            .attr("target", "_blank")
            .text("📖 More info");
    }
    if (d.notes) tooltip.append("div").text(`📝 ${d.notes}`);
}

function filterByGovernor(selectedGovernor) {
    const filtered = selectedGovernor === 'all' 
        ? massacreData 
        : massacreData.filter(d => d.governor === selectedGovernor);
    
    // Redraw visualizations
    d3.select("#map-container").selectAll("*").remove();
    d3.select("#chart-container").selectAll("*").remove();
    
    createMap(filtered);
    createTimelineChart(filtered);
}

const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on("zoom", (event) => {
        g.attr("transform", event.transform
            .translate(margin.left, margin.top));
    });

svg.call(zoom);


function searchMassacres(query) {
    return massacreData.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.governor.toLowerCase().includes(query.toLowerCase()) ||
        d.location.toLowerCase().includes(query.toLowerCase())
    );
}


async function geocodeAddress(address) {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    if (data.results.length > 0) {
        return {
            lat: data.results[0].geometry.location.lat,
            lon: data.results[0].geometry.location.lng
        };
    }
}



async function geocodeOSM(address) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
    }
}

function calculateStats(data) {
    return {
        totalMassacres: data.length,
        totalVictims: d3.sum(data, d => 
            d.stateAction + d.militia + d.police + d.disappearances),
        minorVictims: d3.sum(data, d => d.minors),
        avgVictimsPerIncident: Math.round(
            d3.sum(data, d => d.stateAction + d.militia) / data.length),
        yearsCovered: d3.max(data, d => new Date(d.date).getFullYear()) - 
                     d3.min(data, d => new Date(d.date).getFullYear()),
        governorsInvolved: new Set(data.map(d => d.governor)).size
    };
}
