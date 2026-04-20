// function to load and display valorant agents
async function loadAgents() {

  // get container from html
  const container = document.getElementById('agents');

  // show loading text
  container.textContent = 'loading...';

  try {
    // fetch data from valorant api
    const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');

    // convert response to json
    const data = await response.json();

    // get agents list
    const agents = data.data;

    // clear container
    container.innerHTML = '';

    // loop through agents
    agents.forEach(agent => {

      // create section for each agent
      const section = document.createElement('div');

      // create and display agent name
      const name = document.createElement('h2');
      name.textContent = agent.displayName;
      section.appendChild(name);

      // create and display role
      const role = document.createElement('p');
      role.textContent = 'Role: ' + (agent.role ? agent.role.displayName : 'n/a');
      section.appendChild(role);

      // create and display image
      const img = document.createElement('img');
      img.src = agent.displayIcon;
      img.alt = agent.displayName;
      img.width = 100;
      section.appendChild(img);

      // abilities title
      const abilitiesTitle = document.createElement('p');
      abilitiesTitle.textContent = 'Abilities:';
      section.appendChild(abilitiesTitle);

      // create list for abilities
      const abilityList = document.createElement('ul');

      // loop through abilities
      agent.abilities.forEach(ability => {

        // skip if no ability name
        if (!ability.displayName) return;

        const item = document.createElement('li');

        // add icon if exists
        if (ability.displayIcon) {
          const abilityImg = document.createElement('img');
          abilityImg.src = ability.displayIcon;
          abilityImg.alt = ability.displayName;
          abilityImg.width = 24;
          item.appendChild(abilityImg);
        }

        // add text (name + slot + description)
        const text = document.createTextNode(
          ' ' + ability.displayName +
          ' (' + ability.slot + ')' +
          (ability.description ? ' - ' + ability.description : '')
        );

        item.appendChild(text);
        abilityList.appendChild(item);
      });

      // add ability list to section
      section.appendChild(abilityList);

      // divider
      section.appendChild(document.createElement('hr'));

      // add section to container
      container.appendChild(section);
    });

  } catch (error) {
    // display error if something goes wrong
    container.textContent = 'Error: ' + error.message;
  }
}

// run function
loadAgents();