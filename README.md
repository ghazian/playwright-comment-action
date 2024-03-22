# Playwright Comment Action

This is a POC of ingesting playwright's test results and posting them in the comment section on your PR.

Uses Oktokit for Github API responses.

Usage:
- In your action, once you run your playwright test, generate the JSON file at your desired location
- Add this step:
```     runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./
        with:
          gh-token: ${{ secrets.GITHUB_TOKEN }}
          jsonfile: <playwright file test>
```

Results:
![image](https://github.com/ghazian/playwright-comment-action/assets/51567361/b934bc28-d0b2-42c0-96d7-5b7a7b86731e)
