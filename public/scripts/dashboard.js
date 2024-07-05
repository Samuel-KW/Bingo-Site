class User {
    constructor(name, time, ...bingos) {
        this.name = name;
        this.date = new Date(time);
        this.progress = bingos;
    }
}

function createDotPlot() {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 350 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#dotPlot")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(userData, d => new Date(d.date)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 16])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(userData)
        .enter()
        .append("circle")
        .attr("cx", d => x(new Date(d.date)))
        .attr("cy", d => y(d.progress.filter(Boolean).length))
        .attr("r", 5)
        .attr("fill", "#69b3a2");
}

function createPieChart() {
    const width = 460;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2 - 50},${height / 2})`);

    // Get the most recent data point for each user
    const latestUserData = userData.reduce((acc, curr) => {
        if (!acc[curr.name] || curr.date > acc[curr.name].date)
            acc[curr.name] = curr;

        return acc;
    }, {});

    // Count users in each bingo completion category
    const completedBingos = Object.values(latestUserData).reduce((acc, user) => {
        const completed = user.progress.filter(Boolean).length;
        acc[completed] = (acc[completed] || 0) + 1;
        return acc;
    }, {});

    const totalUsers = Object.values(completedBingos).reduce((sum, count) => sum + count, 0);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(completedBingos))
        .range(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d[1])
        .sort(null);

    const data_ready = pie(Object.entries(completedBingos));

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);

    const slices = svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('g')
        .attr('class', 'slice');

    slices.append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    // Add labels with polylines
    const labelGroup = slices.append('g');

    labelGroup.append('polyline')
        .attr('points', d => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
            return [arcGenerator.centroid(d), outerArc.centroid(d), pos];
        })
        .style('fill', 'none')
        .style('stroke', 'white')
        .style('stroke-width', '1px');

    labelGroup.append('text')
        .attr('transform', d => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 1.05 * (midAngle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', d => {
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midAngle < Math.PI ? 'start' : 'end';
        })
        .text(d => {
            const percentage = (d.data[1] / totalUsers * 100).toFixed(1);
            return `${d.data[1]} (${percentage}%)`;
        })
        .style('font-size', '12px')
        .style('fill', 'white');

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(data_ready)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(150, ${i * 20 - height / 2 + 20})`);

    legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .style('fill', d => color(d.data[0]));

    legend.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .text(d => `${d.data[0]}/16 bingos`)
        .style('fill', 'white')
        .style('font-size', '12px');

    // Add description
    svg.append('text')
        .attr('x', -radius)
        .attr('y', radius + 40)
        .text('Distribution of bingo completions among users')
        .style('font-size', '14px')
        .style('fill', 'white')
        .attr('text-anchor', 'start');
}

function updateOverallStats() {
    const users = userData.reduce((acc, curr) => {
        if (!acc[curr.name] || curr.date > acc[curr.name].date)
            acc[curr.name] = curr;
    
        return acc;
    }, {});

    const uniqueNames = Object.keys(users);
    const avgCompletion = uniqueNames.reduce((acc, user) => acc + users[user].progress.filter(Boolean).length, 0) / userData.length;

    d3.select("#overallStats")
        .html(`<p>Unique Users: ${uniqueNames.length}</p><p>Average Completion: ${avgCompletion.toFixed(2)} / 16</p>`);
}

function createLineChart() {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 350 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#lineChart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 16])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.progress.filter(Boolean).length));

    function updateChart(userName) {
        const name = userData.filter(d => d.name === userName);

        x.domain(d3.extent(name, d => new Date(d.date)));

        svg.selectAll("*").remove();

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(name)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    }

    // Populate user select dropdown
    const userSelect = d3.select("#userSelect");
    const uniqueUsers = [...new Set(userData.map(d => d.name))];
    userSelect.selectAll("option")
        .data(uniqueUsers)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    userSelect.on("change", function () {
        updateChart(this.value);
    });

    // Initial chart
    updateChart(uniqueUsers[0]);
}

let userData = [];

function fetchData() {
    document.getElementById('dotPlot').innerHTML = '';
    document.getElementById('pieChart').innerHTML = '';
    document.getElementById('overallStats').innerHTML = '';
    document.getElementById('lineChart').innerHTML = '';

    return fetch('/data/logs')
        .then(response => response.json())
        .then(data => {
            const [headers, ...logs] = data;
            userData = logs.map(user => new User(...user));
            
            // Initialize all charts
            createDotPlot();
            createPieChart();
            updateOverallStats();
            createLineChart();
        });
}

fetchData();

document.getElementById('refresh').addEventListener('click', async function () {
    this.disabled = true;

    await fetchData();

    this.disabled = false;
});

