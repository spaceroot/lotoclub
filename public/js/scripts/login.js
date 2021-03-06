import { auth } from "./auth.js";

const login = {};

login.init = function () {
  const username = document.querySelector("#username");
  const password = document.querySelector("#password");
  const errorDisplay = document.querySelector("small");
  const submitBtn = document.querySelector("#submit-btn");

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const response = await sendFormData();
    if (response.success) {
      console.log("user is successfully logged in");
      console.log(response);
      auth.token = response.result.token;
      window.location.hash = "combinations";
    } else {
      window.location.hash = "login";
      //TODO: handle wrong username or password
    }
  });

  async function sendFormData() {
    try {
      const userData = {
        username: username.value,
        password: password.value,
      };
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.log(e);
    }
  }
};

export { login };
