import axios from "axios";

export default class Search {
  constructor() {
    this.injectHTML();
    this.headerSearchIcon = document.querySelector(".header-search-icon");
    this.overlay = document.querySelector(".search-overlay");
    this.closeIcon = document.querySelector(".close-live-search");
    this.inputField = document.querySelector("#live-search-field");
    this.resultsArea = document.querySelector(".live-search-results");
    this.loaderIcon = document.querySelector(".circle-loader");
    this.typingWaitTimer;
    this.previousValue = "";
    this.events();
  }

  events() {
    this.inputField.addEventListener("keyup", () => this.keyPressHandler());
    this.closeIcon.addEventListener("click", () => this.closeOverlay());
    this.headerSearchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      this.openOverlay();
    });
  }

  keyPressHandler() {
    const value = this.inputField.value;

    if (value === "") {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.hideResultsArea();
    }

    if (value !== "" && value !== this.previousValue) {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.hideResultsArea();
      this.typingWaitTimer = setTimeout(() => this.sendRequest(), 1000);
    }
    this.previousValue = value;
  }

  async sendRequest() {
    console.log("Sending request...");
    try {
      const response = await axios.post("/search", {
        searchTerm: this.inputField.value,
      });
      if (!response.data) {
        throw new Error("No data received from server");
      }
      this.renderResultsHTML(response.data);
    } catch (error) {
      alert("Request failed. Please try again.");
    }
  }

  renderResultsHTML(data) {

    // Safely destructure posts and users, ensuring they are arrays
    const posts = Array.isArray(data.posts) ? data.posts : [];
    const users = Array.isArray(data.users) ? data.users : [];

    // For debugging:
    // console.log("Posts:", posts);
    // console.log("Users:", users);

    console.log("render request function called!");

    let resultsHTML = "";

    // Users Section
    if (users.length) {
      resultsHTML += `
      <div class="list-group shadow-sm mb-3">
        <div class="list-group-item active"><strong>Users</strong> (${
          users.length
        } found)</div>
        ${users
          .map(
            (user) => `
          <a href="/profile/${user.username}" class="list-group-item list-group-item-action">
            <img class="avatar-tiny" src="${user.avatar}"> 
            <strong>${user.username}</strong>
          </a>
        `
          )
          .join("")}
      </div>`;
    }

    // Posts Section
    if (posts.length) {
      resultsHTML += `
      <div class="list-group shadow-sm">
        <div class="list-group-item active"><strong>Posts</strong> (${
          posts.length
        } found)</div>
        ${posts
          .map((post) => {
            const postDate = new Date(post.createdDate);
            return `
            <a href="/post/${
              post._id
            }" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="${post.author.avatar}"> 
              <strong>${post.title}</strong>
              <span class="text-muted small">
                by ${post.author.username} on 
                ${postDate.getDate()}/${
              postDate.getMonth() + 1
            }/${postDate.getFullYear()}
              </span>
            </a>`;
          })
          .join("")}
      </div>`;
    }

    // No Results
    if (!posts.length && !users.length) {
      resultsHTML = `
      <p class="alert alert-danger text-center shadow-sm">
        No results found for "${this.inputField.value}"
      </p>`;
    }

    // this.resultsArea.innerHTML = DOMPurify.sanitize(resultsHTML);
    this.resultsArea.innerHTML = resultsHTML;

    this.hideLoaderIcon();
    this.showResultsArea();
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add("circle-loader--visible");
  }

  hideLoaderIcon() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  showResultsArea() {
    this.resultsArea.classList.add("live-search-results--visible");
  }

  hideResultsArea() {
    this.resultsArea.classList.remove("live-search-results--visible");
  }

  openOverlay() {
    this.overlay.classList.add("search-overlay--visible");
    setTimeout(() => this.inputField.focus(), 50);
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible");
  }

  injectHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results"></div>
      </div>
    </div>
  </div>`
    );
  }
}
