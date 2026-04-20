// store all agents globally for filtering
let allAgents = [];

// function to load and display valorant agents
async function loadAgents() {

  // get container from html
  const container = document.getElementById('agents');

  // show loading text
  container.textContent = 'Loading Agents...';

  try {
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');

    // checks if there are server errors like 404 / 500
    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const data = await response.json();
    const agents = data.data;

    // save agents and render all by default
    allAgents = agents;
    renderAgents(agents);
    setupFilters();

  } catch (error) {
    // display error if something goes wrong
    container.textContent = 'Error: ' + error.message;
  }
}

// function to render a list of agents into the container
function renderAgents(agents) {

  // get container and templates from html
  const container = document.getElementById('agents');
  const agentTemplate = document.getElementById('agent-template');
  const abilityTemplate = document.getElementById('ability-template');

  container.innerHTML = '';

  // loop through agents
  agents.forEach(agent => {

    // clone agent card from template
    const card = agentTemplate.content.cloneNode(true);

    // create and display image
    const portrait = card.querySelector('.portrait');
    portrait.src = agent.fullPortrait || agent.displayIcon;
    portrait.alt = agent.displayName;
    portrait.loading = 'lazy';

    // create and display agent name
    const name = card.querySelector('.agent-name');
    name.textContent = agent.displayName;

     // create and display role
    const role = card.querySelector('.role');
    role.textContent = 'Role: ' + (agent.role ? agent.role.displayName : 'n/a');

     // abilities title
    const abilityList = card.querySelector('.ability-list');

    // loop through abilities
    agent.abilities.forEach(ability => {

      // skip if no ability name
      if (!ability.displayName) return;

      // clone ability item from template
      const item = abilityTemplate.content.cloneNode(true);

      // add icon if exists
      const abilityIcon = item.querySelector('.ability-icon');
      if (ability.displayIcon) {
        abilityIcon.src = ability.displayIcon;
        abilityIcon.alt = ability.displayName;
        abilityIcon.width = 16;
      } else {
        abilityIcon.remove();
      }

      // add text (name + slot + description)
      const abilityName = item.querySelector('.ability-name');
      abilityName.textContent = ability.displayName;

      // fill in ability slot
      const abilitySlot = item.querySelector('.ability-slot');
      abilitySlot.textContent = '(' + ability.slot + ')'+
          (ability.description ? ' - ' + ability.description : '');

      abilityList.appendChild(item);
    });

    container.appendChild(card);
  });
}

// function to set up role filter buttons
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {

      // set clicked button as active
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // filter agents by role
      const role = btn.dataset.role;
      const filtered = role === 'all'
        ? allAgents
        : allAgents.filter(a => a.role && a.role.displayName === role);

      renderAgents(filtered);
    });
  });
}

// function to find agents based on keyword search
async function findValo(keyword) {

  // return empty if input is blank
  if (!keyword || keyword.trim() === "") {
    return [];
  }

  var data = allAgents;
  var results = [];
  var lowerKeyword = keyword.toLowerCase();

  // loop through all agents
  for (var i = 0; i < data.length; i++) {

    var agent = data[i];

    var nameMatch = false;
    var roleMatch = false;
    var abilityMatches = [];

    // check agent name match
    if (
      agent.displayName &&
      agent.displayName.toLowerCase().includes(lowerKeyword)
    ) {
      nameMatch = true;
    }

    // check role match
    if (
      agent.role &&
      agent.role.displayName &&
      agent.role.displayName.toLowerCase().includes(lowerKeyword)
    ) {
      roleMatch = true;
    }

    // check ability matches 
    for (var j = 0; j < agent.abilities.length; j++) {

      var ability = agent.abilities[j];

      if (
        ability.displayName &&
        ability.displayName.toLowerCase().includes(lowerKeyword)
      ) {
        abilityMatches.push(ability);
      }
    }

    // only add if any match exists
    if (nameMatch || roleMatch || abilityMatches.length > 0) {

      results.push({
        agent: agent,
        matches: {
          name: nameMatch,
          role: roleMatch,
          abilities: abilityMatches
        }
      });
    }
  }

  return results;
}

// function to display search results
async function displayResults() {

  var input = document.getElementById("searchInput");
  var keyword = input.value.toLowerCase();
  var container = document.getElementById("agents");

  if (keyword.length === 0) {
    loadAgents();
    return;
  }

  container.innerHTML = "Searching...";

  var results = await findValo(keyword);

  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "No results found.";
    return;
  }

  var agentTemplate = document.getElementById("agent-template");
  var abilityTemplate = document.getElementById("ability-template");

  for (var i = 0; i < results.length; i++) {

    var agent = results[i].agent;

    // clone card
    var card = agentTemplate.content.cloneNode(true);

    // image
    var img = card.querySelector(".portrait");
    img.src = agent.fullPortrait || agent.displayIcon;
    img.alt = agent.displayName;

    // name
    var name = card.querySelector(".agent-name");
    name.textContent = agent.displayName;

    // role 
    var role = card.querySelector(".role");

    if (results[i].matches.abilities.length > 0) {
      role.textContent = ""; // hide role for ability matches
    } else {
      role.textContent =
        "Role: " + (agent.role ? agent.role.displayName : "Unknown");
    }

    // abilities list
    var list = card.querySelector(".ability-list");
    list.innerHTML = "";

    var matches = results[i].matches;

    // name match 
    if (matches.name) {

      for (var a = 0; a < agent.abilities.length; a++) {

        var ability = agent.abilities[a];

        if (!ability.displayName) continue;

        var item = abilityTemplate.content.cloneNode(true);

        item.querySelector(".ability-name").textContent =
          ability.displayName;

        item.querySelector(".ability-slot").textContent =
          ability.description || "";

        list.appendChild(item);
      }
    }

    // ability match
    else if (matches.abilities.length > 0) {

      for (var b = 0; b < matches.abilities.length; b++) {

        var ab = matches.abilities[b];

        var item = abilityTemplate.content.cloneNode(true);

        item.querySelector(".ability-name").textContent =
          ab.displayName;

        item.querySelector(".ability-slot").textContent =
          ab.description || "";

        list.appendChild(item);
      }
    }

    // role match 
    else if (matches.role) {
      list.innerHTML = "";
    }

    container.appendChild(card);
  }
}

// run function
loadAgents();

// run search while typing
document.getElementById("searchInput").addEventListener("input", function () {
  displayResults();
});