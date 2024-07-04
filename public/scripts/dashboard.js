class User {
    constructor(name, time, ...bingos) {
        this.name = name;
        this.date = new Date(time);
        this.progress = bingos;
    }
}

function createDotPlot() {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 460 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#dotPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
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
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const completedBingos = userData.reduce((acc, user) => {
        const completed = user.progress.filter(Boolean).length;
        acc[completed] = (acc[completed] || 0) + 1;
        return acc;
    }, {});

    const color = d3.scaleOrdinal()
        .domain(Object.keys(completedBingos))
        .range(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d[1]);

    const data_ready = pie(Object.entries(completedBingos));

    svg.selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px");
}

function updateOverallStats() {
    const uniqueNames = new Set(userData.map(d => d.name)).size;
    const avgCompletion = userData.reduce((acc, user) => acc + user.progress.filter(Boolean).length, 0) / userData.length;

    d3.select("#overallStats")
        .html(`<p>Unique Users: ${uniqueNames}</p><p>Average Completion: ${avgCompletion.toFixed(2)} / 16</p>`);
}

function createLineChart() {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 460 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#lineChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
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

fetch('/data/logs')
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

