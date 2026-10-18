const API_BASE_URL = "https://comp4537-lab5-c3-api.onrender.com/lab5/api/v1";

// Talks to server2.
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async insertPatients() {
        const response = await fetch(`${this.baseUrl}/patients`, {
            method: "POST"
        });

        return response.json();
    }

    async runQuery(sql) {
        const response = await fetch(
            `${this.baseUrl}/sql/${encodeURIComponent(sql)}`
        );

        return response.json();
    }
}

// Controls the page: sets the text, handles the buttons, shows the answer.
class PageController {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.queryInput = document.getElementById("queryInput");
        this.output = document.getElementById("output");
    }

    start() {
        document.title = MESSAGES.pageTitle;
        document.getElementById("heading").textContent = MESSAGES.heading;
        document.getElementById("insertButton").textContent =
            MESSAGES.insertButton;
        document.getElementById("queryLabel").textContent =
            MESSAGES.queryLabel;
        document.getElementById("submitButton").textContent =
            MESSAGES.submitButton;
        document.getElementById("responseHeading").textContent =
            MESSAGES.responseHeading;
        this.queryInput.value = MESSAGES.defaultQuery;

        document.getElementById("insertButton").addEventListener(
            "click",
            () => this.show(this.apiClient.insertPatients())
        );

        document.getElementById("submitButton").addEventListener(
            "click",
            () => this.show(this.apiClient.runQuery(this.queryInput.value))
        );
    }

    async show(request) {
        try {
            const data = await request;

            this.output.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            this.output.textContent = MESSAGES.networkError;
        }
    }
}

const page = new PageController(new ApiClient(API_BASE_URL));
page.start();
