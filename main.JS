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

// run function
loadAgents();