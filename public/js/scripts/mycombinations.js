import { auth } from "./auth.js";

const mycombinations = {};

mycombinations.init = () => {
  const tabSelectors = document.querySelector(".tab-selectors");
  const combDisplay = document.querySelector(".combination-display");
  const mainCombDisplay = document.querySelectorAll(".combination-display .main");
  const euroCombDisplay = document.querySelectorAll(".combination-display .euro");
  const mainNumbers = document.querySelectorAll("#numbers-table .main .number");
  const euroNumbers = document.querySelectorAll("#numbers-table .euro .number");
  const numbers = document.querySelector("#numbers-table");
  const saveBtn = document.querySelector("#save-btn");
  const info = document.querySelector("#info");

  let combIndex = 0;
  let combinations = [];
  let combination;

  init();

  async function init() {
    combinations = await fetchCombinations();
    combination = combinations[0];
    createTabSelectors();
    displayCombination();
    styleTable();
  }

  /*
   * Fetch combinations from server api
   */
  async function fetchCombinations() {
    try {
      const res = await fetch("/api/combinations/me", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      return data.result;
    } catch (err) {
      console.dir(err);
    }
  }

  /*
   * Create tabSelectors for combination control
   * according to fetched combinations data
   */
  function createTabSelectors() {
    let i = 1;
    for (const comb of combinations) {
      const tab = document.createElement("button");
      tab.classList.add("tab-selector");
      i === 1 && tab.classList.add("selected");
      tab.id = comb.name;
      tab.innerText = comb.name; // <--------------------- change to custom name "Glavna", "Dodatna" etc (switch)!!!!!!!!!
      tabSelectors.append(tab);
      i++;
    }
  }

  /*
   * Tabs control
   * Switches between different combinations
   */
  tabSelectors.addEventListener("click", (e) => {
    combIndex = parseInt(e.target.id.slice(-1)) - 1;
    combination = combinations.filter((comb) => {
      return comb.name === e.target.id;
    })[0];
    displayCombination();
    styleTable();
    for (const tab of tabSelectors.children) {
      tab.classList.remove("selected");
    }
    e.target.classList.add("selected");
  });

  /*
   * Populate combination display
   */
  function displayCombination() {
    let i = 0;
    for (const number of mainCombDisplay) {
      number.innerText = combination.mainNums[i] || "";
      i++;
    }
    i = 0;
    for (const number of euroCombDisplay) {
      number.innerText = combination.euroNums[i] || "";
      i++;
    }
    combDisplay.classList.remove("editing");
    info.innerText = "";
    if (combination.isEdited) {
      combDisplay.classList.add("editing");
      if (combination.mainNums.length === 5 && combination.euroNums.length === 2) {
        info.innerText = "Trebate spremiti novu kombinaciju";
      }
    }
  }

  /*
   * Style numbers in table according to combination
   */
  function styleTable() {
    styleNums(mainNumbers, combination.mainNums, 5);
    styleNums(euroNumbers, combination.euroNums, 2);

    function styleNums(tabNums, nums, n) {
      for (let number of tabNums) {
        number.classList.remove("selected");
        for (let num of nums) {
          if (parseInt(number.innerText) === num) {
            number.classList.add("selected");
            if (nums.length === n) {
              number.classList.add("success");
            } else {
              number.classList.remove("success");
            }
          }
        }
      }
    }
  }

  /*
   * Triggers adding or deleting numbers from combination
   */
  numbers.addEventListener("click", (e) => {
    const selectedNum = parseInt(e.target.innerText);
    if (e.target.closest(".column.main")) {
      addNumber(selectedNum, "mainNums");
    } else if (e.target.closest(".column.euro")) {
      addNumber(selectedNum, "euroNums");
    }
    displayCombination();
    styleTable();
  });

  /*
   * Add or delete number from combination
   */
  function addNumber(num, select) {
    select === "mainNums" ? (length = 5) : (length = 2);
    // deletes number if it is present
    if (combination[select].includes(num)) {
      const index = combination[select].indexOf(num);
      console.log("deleted: ", combination[select].splice(index, 1));
      // adds number if there is room
    } else if (combination[select].length < length) {
      combination[select].push(num);
      combination[select].sort((a, b) => (a < b ? -1 : 1));
    } else {
      console.log("cant add or delete number");
      return false;
    }
    combination.isEdited = true;
  }

  /*
   * Changes combination or adds new if first time
   * according to selected numbers
   * and posts changes to server
   */
  saveBtn.addEventListener("click", async () => {
    if (combination.mainNums.length === 5 && combination.euroNums.length === 2) {
      const index = combinations.findIndex((comb) => {
        return comb.name === combination.name;
      });
      combinations[index] = combination;
      delete combination.isEdited;
      const data = await postCombination();
      if (data) {
        displayCombination();
        styleTable();
        showMessage("Kombinacija uspješno spremljena", "success");
      } else {
        showMessage("Nešto je pošlo krivo :(", "warning");
      }
    } else {
      showMessage("Kombinacije nisu potpune", "warning");
    }
  });

  /*
   * Post combination to server
   */
  async function postCombination() {
    try {
      const res = await fetch("/api/combinations/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify(combination),
      });
      const data = await res.json();
      console.log(data);
      return data.result;
    } catch (e) {
      console.log(e);
    }
  }

  /*
   * Display message
   */
  function showMessage(message, type) {
    info.innerText = message;
    if (type === "warning") {
      info.classList.remove("success");
    } else if (type === "success") {
      info.classList.add("success");
      setTimeout(() => {
        info.innerText = "";
        info.classList.remove("success");
      }, 3000);
      combDisplay.classList.add("successful");
      setTimeout(() => combDisplay.classList.remove("successful"), 3000);
    }
  }
};

export { mycombinations };
